"""FastAPI entry — Architecture A resource server skeleton (A1)."""
from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from app.api.v1.api_router import api_router
from app.core.config import settings
from app.db.session import AsyncSessionLocal


@asynccontextmanager
async def lifespan(_app: FastAPI):
    yield


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.image_tag,
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    application.include_router(api_router)
    return application


app = create_application()


@app.get("/health", response_class=JSONResponse)
async def health_check() -> JSONResponse:
    return JSONResponse(content={"status": "healthy"}, status_code=200)


@app.get("/ready", response_class=JSONResponse)
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
        return JSONResponse(
            content={"status": "not_ready", "detail": str(exc)},
            status_code=503,
        )
