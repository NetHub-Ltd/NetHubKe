"""Audit emission and one-shot platform admin bootstrap."""
from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel import SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_token_data
from app.core.config import settings
from app.db.models.models import AuditEvent, User
from app.db.schemas.schemas import TokenData
from app.db.session import get_session
from app.main import app

ISSUER = "https://idp.test/realms/nethub"


@pytest.fixture
async def api(monkeypatch):
    monkeypatch.setenv("BOOTSTRAP_ADMIN_EMAILS", "admin@example.com")
    from app.core import config as config_module

    config_module.get_settings.cache_clear()
    # Re-bind settings used by user crud
    import app.crud.user as user_mod

    user_mod.get_settings.cache_clear() if hasattr(user_mod.get_settings, "cache_clear") else None

    engine = create_async_engine(settings.async_database_uri, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

    maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    current = {
        "token": TokenData(
            sub="admin-sub",
            email="admin@example.com",
            name="Admin",
            issuer=ISSUER,
        )
    }

    async def _override_session():
        async with maker() as session:
            yield session

    async def _override_token():
        return current["token"]

    app.dependency_overrides[get_session] = _override_session
    app.dependency_overrides[get_token_data] = _override_token

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client, current, maker

    app.dependency_overrides.clear()
    config_module.get_settings.cache_clear()
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest.mark.asyncio
async def test_bootstrap_admin_one_shot_and_audit(api):
    client, current, maker = api
    r = await client.post("/api/v1/users/sync")
    assert r.status_code == 200
    assert r.json()["is_admin"] is True

    async with maker() as session:
        events = (
            await session.exec(
                select(AuditEvent).where(AuditEvent.action == "platform.admin.bootstrap")
            )
        ).all()
        assert len(events) == 1
        user = (
            await session.exec(select(User).where(User.email == "admin@example.com"))
        ).first()
        assert user is not None
        user.is_admin = False
        session.add(user)
        await session.commit()

    # Second sync must NOT re-elevate
    r2 = await client.post("/api/v1/users/sync")
    assert r2.status_code == 200
    assert r2.json()["is_admin"] is False

    async with maker() as session:
        events = (
            await session.exec(
                select(AuditEvent).where(AuditEvent.action == "platform.admin.bootstrap")
            )
        ).all()
        assert len(events) == 1


@pytest.mark.asyncio
async def test_platform_admin_endpoint_and_trusted_client_audit(api):
    client, current, maker = api
    await client.post("/api/v1/users/sync")

    # Create a non-admin user
    current["token"] = TokenData(
        sub="u2", email="user2@example.com", name="U2", issuer=ISSUER
    )
    sync2 = await client.post("/api/v1/users/sync")
    uid2 = sync2.json()["id"]
    assert sync2.json()["is_admin"] is False

    current["token"] = TokenData(
        sub="admin-sub", email="admin@example.com", name="Admin", issuer=ISSUER
    )
    grant = await client.post(
        f"/api/v1/admin/users/{uid2}/platform-admin",
        json={"is_admin": True},
    )
    assert grant.status_code == 200, grant.text
    assert grant.json()["is_admin"] is True

    created = await client.post(
        "/api/v1/admin/trusted-clients",
        json={"client_id": "spa-1", "name": "SPA", "product": "website"},
    )
    assert created.status_code == 201, created.text

    async with maker() as session:
        actions = {
            e.action
            for e in (
                await session.exec(select(AuditEvent))
            ).all()
        }
        assert "platform.admin.grant" in actions
        assert "trusted_client.create" in actions
