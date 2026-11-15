"""FastAPI entry — Architecture A resource server."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy import text
from starlette.middleware.cors import CORSMiddleware

from app.api.v1.api_router import api_router
from app.core.config import get_settings, settings
from app.core.logging import get_logger, setup_logging
from app.core.middleware import RequestLoggingMiddleware
from app.core.rate_limit import limiter
from app.core.security_headers import SecurityHeadersMiddleware
from app.db.session import AsyncSessionLocal

log = get_logger("boot")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    setup_logging(level="INFO")
    log.info(
        "startup app={} version={} env={} oidc_issuer={} resource_audiences={} bootstrap_audiences={} diagnostics={} rate_limit={}",
        settings.app_name,
        settings.image_tag,
        settings.environment,
        settings.oidc_issuer,
        settings.resource_audiences,
        settings.audiences,
        settings.diagnostics_enabled,
        settings.rate_limit_enabled,
    )
    yield
    log.info("shutdown")


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.image_tag,
        lifespan=lifespan,
    )
    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    application.add_middleware(SecurityHeadersMiddleware)
    application.add_middleware(RequestLoggingMiddleware)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-Id", "Accept"],
    )
    application.include_router(api_router)

    @application.get("/health")
    async def health_check() -> JSONResponse:
        return JSONResponse(content={"status": "healthy"}, status_code=200)

    @application.get("/ready")
    async def readiness_check() -> JSONResponse:
        cfg = get_settings()
        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute(text("SELECT 1"))
                val = result.scalar_one()
                if int(val) != 1:
                    return JSONResponse(
                        content={"status": "not_ready", "detail": "dependency check failed"},
                        status_code=503,
                    )
            return JSONResponse(content={"status": "ready"}, status_code=200)
        except Exception as exc:  # noqa: BLE001
            # Log full error server-side; never return infrastructure strings in production.
            log.warning("ready_failed error={}", str(exc))
            detail = "dependency check failed"
            if cfg.environment == "development":
                detail = f"dependency check failed: {type(exc).__name__}"
            return JSONResponse(
                content={"status": "not_ready", "detail": detail},
                status_code=503,
            )

    @application.get("/diagnostics")
    async def diagnostics() -> JSONResponse:
        """Operator diagnostics — disabled in production unless DIAGNOSTICS_ENABLED=true."""
        cfg = get_settings()
        if not cfg.diagnostics_enabled and cfg.environment == "production":
            return JSONResponse(content={"detail": "Not found"}, status_code=404)
        db_ok = False
        db_detail = None
        try:
            async with AsyncSessionLocal() as session:
                result = await session.execute(text("SELECT 1"))
                db_ok = int(result.scalar_one()) == 1
        except Exception as exc:  # noqa: BLE001
            log.warning("diagnostics_db_check error={}", str(exc))
            # Opaque in production/staging; short type name only in development.
            if cfg.environment == "development":
                db_detail = type(exc).__name__
            else:
                db_detail = "unavailable"
        return JSONResponse(
            content={
                "app": cfg.app_name,
                "version": cfg.image_tag,
                "environment": cfg.environment,
                "oidc_issuer": cfg.oidc_issuer,
                "audiences": cfg.audiences,
                "resource_audiences": cfg.resource_audiences,
                "jwks_url": cfg.resolved_jwks_url,
                "diagnostics_enabled": cfg.diagnostics_enabled,
                "rate_limit_enabled": cfg.rate_limit_enabled,
                "db_ok": db_ok,
                "db_detail": db_detail,
            },
            status_code=200,
        )

    return application


app = create_application()
