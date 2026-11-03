"""A4: user sync / me / patch API tests."""
from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_token_data
from app.core.config import settings
from app.db.models.models import User, UserIdentity
from app.db.schemas.schemas import TokenData
from app.db.session import get_session
from app.main import app


ISSUER = "https://idp.test/realms/nethub"


def _token(
    *,
    sub: str = "sub-1",
    email: str | None = "user@example.com",
    name: str = "Test User",
    preferred_username: str = "testuser",
) -> TokenData:
    return TokenData(
        sub=sub,
        email=email,
        name=name,
        preferred_username=preferred_username,
        issuer=ISSUER,
    )


@pytest.fixture
async def api_client():
    engine = create_async_engine(settings.async_database_uri, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

    maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def _override_session():
        async with maker() as session:
            yield session

    # default token for authenticated paths
    current = {"token": _token()}

    async def _override_token():
        return current["token"]

    app.dependency_overrides[get_session] = _override_session
    app.dependency_overrides[get_token_data] = _override_token

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client, current

    app.dependency_overrides.clear()
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest.mark.asyncio
async def test_sync_creates_user(api_client):
    client, _ = api_client
    response = await client.post("/api/v1/users/sync")
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["email"] == "user@example.com"
    assert body["id"]
    assert "access_token" not in body


@pytest.mark.asyncio
async def test_sync_idempotent(api_client):
    client, _ = api_client
    r1 = await client.post("/api/v1/users/sync")
    r2 = await client.post("/api/v1/users/sync")
    assert r1.status_code == 200 and r2.status_code == 200
    assert r1.json()["id"] == r2.json()["id"]


@pytest.mark.asyncio
async def test_me_after_sync(api_client):
    client, _ = api_client
    await client.post("/api/v1/users/sync")
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 200
    assert response.json()["email"] == "user@example.com"


@pytest.mark.asyncio
async def test_me_without_sync_404(api_client):
    client, _ = api_client
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_patch_me(api_client):
    client, _ = api_client
    await client.post("/api/v1/users/sync")
    response = await client.patch("/api/v1/users/me", json={"full_name": "Updated Name"})
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Name"


@pytest.mark.asyncio
async def test_email_collision_409(api_client):
    client, current = api_client
    await client.post("/api/v1/users/sync")
    # different subject, same email
    current["token"] = _token(sub="other-sub", email="user@example.com")
    response = await client.post("/api/v1/users/sync")
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_unauthenticated_401():
    """No dependency override — real get_token_data requires Bearer."""
    engine = create_async_engine(settings.async_database_uri, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def _override_session():
        async with maker() as session:
            yield session

    app.dependency_overrides[get_session] = _override_session
    # leave get_token_data as real
    app.dependency_overrides.pop(get_token_data, None)

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        for path, method in [
            ("/api/v1/users/sync", "post"),
            ("/api/v1/users/me", "get"),
            ("/api/v1/users/me", "patch"),
        ]:
            if method == "post":
                response = await client.post(path)
            elif method == "get":
                response = await client.get(path)
            else:
                response = await client.patch(path, json={"full_name": "x"})
            assert response.status_code == 401, path

    app.dependency_overrides.clear()
    await engine.dispose()
