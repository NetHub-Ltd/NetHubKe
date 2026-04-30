import asyncio
from typing import AsyncGenerator, Generator

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.main import app
from app.api.deps import get_session
# from app.lib.db.models import User, Order, Service, BlogPost, Authors  # noqa: F401
from app.db.models.models import User, Service

# ---------------------------------------------------------
# Test Database Configuration
# ---------------------------------------------------------
# Using sqlite+aiosqlite with StaticPool ensures the in-memory
# database persists for the duration of the connection.
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine: AsyncEngine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


# ---------------------------------------------------------
# Async Event Loop Setup
# ---------------------------------------------------------
@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """
    Creates an instance of the default event loop for the test session.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


# ---------------------------------------------------------
# Database Lifecycle & Session Fixtures
# ---------------------------------------------------------
@pytest_asyncio.fixture(scope="function", autouse=True)
async def init_db():
    """
    Ensures a clean database schema for every single test.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Provides a clean async session for CRUD-level integration tests.
    """
    async with TestingSessionLocal() as session:
        yield session


# ---------------------------------------------------------
# FastAPI Client & Dependency Injection
# ---------------------------------------------------------
@pytest_asyncio.fixture
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """
    Provides an AsyncClient for endpoint testing with
    the get_session dependency overridden.
    """

    async def _get_test_db():
        yield db_session

    app.dependency_overrides[get_session] = _get_test_db

    # Use ASGITransport for testing the app directly without a network port
    transport = ASGITransport(
        app=app,
        raise_app_exceptions=False,  # 👈 THIS IS THE KEY
    )
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
