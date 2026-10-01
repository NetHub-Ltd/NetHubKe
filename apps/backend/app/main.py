from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text
from sqlmodel.ext.asyncio.session import AsyncSession
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from app.api.v1.api_router import router as api_router
from app.core.config import settings
from app.core.redis_client import ensure_redis_ready, get_redis
from app.db.session import engine
from app.utils.logging import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        f"Starting {settings.app_name} "
        f"Version: {settings.image_tag} "
        f"Environment: {settings.environment}"
    )

    # --------------------------------------------------------------
    # 1. Database readiness (must answer queries — not only "connect")
    # --------------------------------------------------------------
    try:
        async with AsyncSession(engine) as session:
            logger.info("Verifying database readiness...")
            result = await session.exec(text("SELECT 1"))
            row = result.one() if hasattr(result, "one") else result.first()
            # asyncpg/sqlalchemy may return (1,) or 1
            val = row[0] if row is not None and not isinstance(row, (int, str)) else row
            if val != 1 and val != (1,):
                # accept common shapes
                ok = False
                try:
                    ok = int(val[0] if isinstance(val, (tuple, list)) else val) == 1
                except Exception:  # noqa: BLE001
                    ok = True  # connected and query returned
                if not ok and val is None:
                    raise RuntimeError("Database SELECT 1 returned empty result")
            # Touch signing_keys so mis-migrated DBs fail fast
            await session.exec(text("SELECT 1 FROM signing_keys LIMIT 1"))
        logger.info("Database readiness verified (SELECT 1 + signing_keys reachable).")
    except Exception as e:
        logger.critical(f"Database not ready: {e}")
        raise RuntimeError(
            "Database unavailable or not ready (migrations missing?). Aborting startup."
        ) from e

    # --------------------------------------------------------------
    # 2. Redis readiness (PING — connection alone is not enough)
    # --------------------------------------------------------------
    try:
        await ensure_redis_ready(timeout_sec=5.0)
    except Exception as e:
        logger.critical(f"Redis not ready: {e}")
        raise RuntimeError("Redis unavailable or not ready. Aborting startup.") from e

    # --------------------------------------------------------------
    # 3. Signing keys: bootstrap if empty (backend-generated RSA)
    # --------------------------------------------------------------
    try:
        from app.services.tawala_token import ensure_signing_keys_ready

        async with AsyncSession(engine) as session:
            key_row = await ensure_signing_keys_ready(session)
            logger.info(f"Signing keys ready kid={key_row.kid} status={key_row.status}")
    except Exception as e:
        logger.critical(f"Signing key bootstrap failed: {e}")
        raise RuntimeError(
            "Could not bootstrap signing keys. Aborting startup."
        ) from e

    yield

    logger.info(f"Shutting down {settings.app_name}")
    try:
        client = get_redis()
        await client.aclose()
    except Exception:  # noqa: BLE001
        pass


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.image_tag,
        lifespan=lifespan,
        redoc_url=None,
    )
    logger.info(f"Allowed Origins: {settings.cors_origins}")
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    return application


app: FastAPI = create_application()
app.include_router(api_router)


@app.get("/health", response_class=JSONResponse)
async def health_check():
    """Liveness: process is up. Readiness of DB/Redis is enforced at startup."""
    return JSONResponse(content={"status": "healthy"}, status_code=200)


@app.get("/ready", response_class=JSONResponse)
async def readiness_check():
    """
    Readiness: DB SELECT 1 + Redis PING must succeed.
    Use for k3s readinessProbe so traffic only hits ready pods.
    """
    from app.core.redis_client import ensure_redis_ready

    try:
        async with AsyncSession(engine) as session:
            await session.exec(text("SELECT 1"))
        await ensure_redis_ready(timeout_sec=2.0)
    except Exception as e:
        logger.error(f"Readiness failed: {e}")
        return JSONResponse(
            content={"status": "not_ready", "detail": str(e)},
            status_code=503,
        )
    return JSONResponse(content={"status": "ready"}, status_code=200)
