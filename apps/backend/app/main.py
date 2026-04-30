from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text
from sqlmodel.ext.asyncio.session import AsyncSession
from starlette.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse
from app.api.v1.api_router import router as api_router

from app.core.config import settings
from app.db.session import engine
from app.utils.logging import logger
from loguru import logger

# setup_logging()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(
        f"Starting {settings.app_name} "
        f"Version: {settings.image_tag} "
        f"Environment: {settings.environment}"
    )

    # --------------------------------------------------------------
    # 1. Database Connectivity
    # --------------------------------------------------------------
    try:
        async with AsyncSession(engine) as session:
            logger.info("Verifying database connectivity...")
            await session.exec(text("SELECT 1"))
        logger.info("Database connectivity verified.")
    except Exception as e:
        logger.critical(f"Database connection failed: {e}")
        raise RuntimeError("Database unavailable. Aborting startup.") from e
    yield

    logger.info(f"Shutting down {settings.app_name}")


def create_application() -> FastAPI:
    """
    Factory function to initialize the FastAPI app.
    """
    application = FastAPI(
        title=settings.app_name,
        version=settings.image_tag,
        lifespan=lifespan,
        # docs_url="/docs" if settings.environment != "production" else None,
        redoc_url=None,
    )
    logger.info(f"Allowe Origins: {settings.cors_origins}")
    # 1. Middleware
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,  # In production, specify allowed origins
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    return application


app: FastAPI = create_application()

app.include_router(api_router)

@app.get("/health", response_class=JSONResponse)
async def health_check():
    """
    Health check endpoint to verify that the API is running.
    """
    return JSONResponse(content={"status": "healthy"}, status_code=200)




