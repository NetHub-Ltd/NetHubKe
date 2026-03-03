from typing import AsyncGenerator
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.session import AsyncSessionLocal
from app.utils.logging import logger


# from app.core.config import MpesaSettings
# from app.lib.db.session import AsyncSessionLocal
# from app.lib.utils.logger_setup import logger


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to provide a scoped AsyncSession for each request.
    Ensures the session is closed and handles potential SQLAlchemy errors.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            # Optional: You could auto-commit here, but it's cleaner to
            # handle commits inside your CRUD/Service layer logic.
        except SQLAlchemyError as e:
            logger.error(f"Database session error: {str(e)}", exc_info=True)
            # Rollback is automatically handled by the 'async with' context manager
            # on exit if an exception is raised, but we log it for observability.
            raise
        finally:
            await session.close()


# def get_mpesa_config():
#     return MpesaSettings()
