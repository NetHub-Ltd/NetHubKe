"""Service applications, admin, trusted clients."""
from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_token_data
from app.core.config import settings
from app.crud import trusted_clients as tc_crud
from app.db.schemas.schemas import TokenData
from app.db.session import get_session
from app.main import app

ISSUER = "https://idp.test/realms/nethub"


def _token(email: str = "user@example.com", sub: str = "sub-user") -> TokenData:
    return TokenData(
        sub=sub,
        email=email,
        name="User",
        preferred_username=email.split("@")[0],
        issuer=ISSUER,
        client_id="test-client",
    )


def _admin_token() -> TokenData:
    return _token(email="admin@nethub.co.ke", sub="sub-admin")


@pytest.fixture
async def api_client(monkeypatch):
    monkeypatch.setenv("BOOTSTRAP_ADMIN_EMAILS", "admin@nethub.co.ke")
    from app.core import config as config_module

    config_module.get_settings.cache_clear()

    engine = create_async_engine(settings.async_database_uri, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

    maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def _override_session():
        async with maker() as session:
            yield session

    current = {"token": _token()}

    async def _override_token():
        return current["token"]

    app.dependency_overrides[get_session] = _override_session
    app.dependency_overrides[get_token_data] = _override_token

    # seed trusted client so non-overridden paths work if needed
    async with maker() as session:
        await tc_crud.create_client(
            session, client_id="test-client", name="Test", product="website", notes=""
        )

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client, current

    app.dependency_overrides.clear()
    config_module.get_settings.cache_clear()
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest.mark.asyncio
async def test_list_services_seeded(api_client):
    client, _ = api_client
    r = await client.get("/api/v1/services")
    assert r.status_code == 200, r.text
    data = r.json()
    assert len(data) >= 4
    slugs = {s["slug"] for s in data}
    assert "website-development-kenya" in slugs
    assert "tawala" not in slugs
    assert "netpay" not in slugs


@pytest.mark.asyncio
async def test_create_and_list_application(api_client):
    client, _ = api_client
    await client.post("/api/v1/users/sync")
    r = await client.post(
        "/api/v1/applications",
        json={
            "service_slug": "website-development-kenya",
            "title": "New site",
            "body": "We need a simple business website with contact form and clear services.",
            "budget_band": "50k-150k",
            "timeline": "4-6 weeks",
        },
    )
    assert r.status_code == 201, r.text
    app_body = r.json()
    assert app_body["status"] == "submitted"
    assert app_body["service"]["slug"] == "website-development-kenya"

    listed = await client.get("/api/v1/applications")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


@pytest.mark.asyncio
async def test_user_message_on_own_application(api_client):
    client, _ = api_client
    await client.post("/api/v1/users/sync")
    created = await client.post(
        "/api/v1/applications",
        json={
            "service_slug": "seo-conversion-kenya",
            "body": "Help us improve search visibility for our Nairobi shop.",
        },
    )
    app_id = created.json()["id"]
    msg = await client.post(
        f"/api/v1/applications/{app_id}/messages",
        json={"body": "We can start next month."},
    )
    assert msg.status_code == 200, msg.text
    assert msg.json()["is_from_admin"] is False


@pytest.mark.asyncio
async def test_admin_bootstrap_and_reply(api_client):
    client, current = api_client
    # create user application
    current["token"] = _token()
    await client.post("/api/v1/users/sync")
    created = await client.post(
        "/api/v1/applications",
        json={
            "service_slug": "mobile-app-development",
            "body": "We want a booking app for our clinic staff and patients.",
        },
    )
    app_id = created.json()["id"]

    # admin
    current["token"] = _admin_token()
    sync = await client.post("/api/v1/users/sync")
    assert sync.status_code == 200
    assert sync.json()["is_admin"] is True

    listed = await client.get("/api/v1/admin/applications")
    assert listed.status_code == 200
    assert any(a["id"] == app_id for a in listed.json())

    reply = await client.post(
        f"/api/v1/admin/applications/{app_id}/messages",
        json={"body": "Thanks — we will send a short proposal this week."},
    )
    assert reply.status_code == 200
    assert reply.json()["is_from_admin"] is True

    status_r = await client.patch(
        f"/api/v1/admin/applications/{app_id}",
        json={"status": "quoted"},
    )
    assert status_r.status_code == 200
    assert status_r.json()["status"] == "quoted"


@pytest.mark.asyncio
async def test_non_admin_cannot_list_admin_apps(api_client):
    client, current = api_client
    current["token"] = _token()
    await client.post("/api/v1/users/sync")
    r = await client.get("/api/v1/admin/applications")
    assert r.status_code == 403


@pytest.mark.asyncio
async def test_trusted_client_admin_crud(api_client):
    client, current = api_client
    current["token"] = _admin_token()
    await client.post("/api/v1/users/sync")
    created = await client.post(
        "/api/v1/admin/trusted-clients",
        json={"client_id": "new-client-99", "name": "Website", "product": "website"},
    )
    assert created.status_code == 201, created.text
    revoked = await client.post("/api/v1/admin/trusted-clients/new-client-99/revoke")
    assert revoked.status_code == 200
    assert revoked.json()["is_active"] is False
