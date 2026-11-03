from typing import AsyncGenerator

from loguru import logger
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, async_sessionmaker
from sqlmodel.ext.asyncio.session import AsyncSession
from app.core.config import settings

# ---------------------------------------------------------
# Async Engine Configuration
# ---------------------------------------------------------
# We use QueuePool for production to reuse connections.
# Adjust pool_size and max_overflow based on your DB instance size.
engine: AsyncEngine = create_async_engine(
    settings.async_db_url,
    echo=False,
    future=True,
    pool_size=20,  # Maintain up to 20 "warm" connections
    max_overflow=10,  # Allow 10 extra connections during spikes
    pool_timeout=30,  # Wait 30s for a connection before failing
    pool_recycle=1800,  # Recycle connections every 30 mins to prevent stale links
    pool_pre_ping=True,  # Check connection health before passing to session
    connect_args={
        "server_settings": {
            "timezone": "UTC",
        }
    },
)

# ---------------------------------------------------------
# SQLModel AsyncSession Factory
# ---------------------------------------------------------
# async_sessionmaker is the modern, type-safe way to create session factories
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Provides a scoped AsyncSession for each request.
    Optimized for SQLModel + asyncpg.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            # We don't commit here. The Service Layer handles the 'Save'.
        except SQLAlchemyError as e:
            # Explicit rollback ensures the DB connection is clean
            await session.rollback()
            logger.error("DB Session Error | {}", str(e))
            raise
        # No 'finally' needed; 'async with' handles closure automatically