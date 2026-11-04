"""FastAPI entry — Architecture A resource server."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from app.core.logging import get_logger
from sqlalchemy import text
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from app.api.v1.api_router import api_router
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.middleware import RequestLoggingMiddleware
from app.db.session import AsyncSessionLocal

log = get_logger("boot")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    setup_logging(level="INFO")
    log.info(
        "startup app={} version={} env={} oidc_issuer={}",
        settings.app_name,
        settings.image_tag,
        settings.environment,
        settings.oidc_issuer,
    )
    yield
    log.info("shutdown")


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.image_tag,
        lifespan=lifespan,
    )
    application.add_middleware(RequestLoggingMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(api_router)

    @application.get("/health", response_class=JSONResponse)
    async def health_check() -> JSONResponse:
        return JSONResponse(content={"status": "healthy"}, status_code=200)

    @application.get("/ready", response_class=JSONResponse)
    async def readiness_check() -> JSONResponse:
        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute(text("SELECT 1"))
                val = result.scalar_one()
                if int(val) != 1:
                    return JSONResponse(
                        content={"status": "not_ready", "detail": "unexpected SELECT 1 result"},
                        status_code=503,
                    )
            return JSONResponse(content={"status": "ready"}, status_code=200)
        except Exception as exc:  # noqa: BLE001
            log.warning("ready_failed error={}", str(exc))
            return JSONResponse(
                content={"status": "not_ready", "detail": str(exc)},
                status_code=503,
            )

    @application.get("/diagnostics", response_class=JSONResponse)
    async def diagnostics() -> JSONResponse:
        """Non-secret runtime diagnostics for operators / BFF probes."""
        db_ok = False
        db_detail = ""
        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute(text("SELECT 1"))
                db_ok = int(result.scalar_one()) == 1
        except Exception as exc:  # noqa: BLE001
            db_detail = str(exc)
        return JSONResponse(
            content={
                "app": settings.app_name,
                "version": settings.image_tag,
                "environment": settings.environment,
                "oidc_issuer": settings.oidc_issuer,
                "audience": settings.audience,
                "db_ok": db_ok,
                "db_detail": db_detail or None,
            },
            status_code=200,
        )

    return application


app = create_application()
