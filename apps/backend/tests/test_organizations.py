"""Organization membership isolation and lifecycle."""
from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlmodel import SQLModel, select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.api.deps import get_token_data
from app.core.config import settings
from app.db.models.models import AuditEvent, OrganizationMembership, User
from app.db.schemas.schemas import TokenData
from app.db.session import get_session
from app.main import app

ISSUER = "https://idp.test/realms/nethub"


def _token(sub: str, email: str) -> TokenData:
    return TokenData(sub=sub, email=email, name=email, issuer=ISSUER)


@pytest.fixture
async def org_client():
    engine = create_async_engine(settings.async_database_uri, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

    maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    current = {"token": _token("sub-a", "a@example.com")}

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
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
    await engine.dispose()


@pytest.mark.asyncio
async def test_create_and_list_org(org_client):
    client, current, _ = org_client
    await client.post("/api/v1/users/sync")
    r = await client.post(
        "/api/v1/organizations",
        json={"name": "Acme Ltd", "slug": "acme-ltd"},
    )
    assert r.status_code == 201, r.text
    body = r.json()
    assert body["organization"]["slug"] == "acme-ltd"
    assert body["membership"]["role"] == "owner"

    listed = await client.get("/api/v1/organizations")
    assert listed.status_code == 200
    assert len(listed.json()) == 1


@pytest.mark.asyncio
async def test_cross_org_access_denied(org_client):
    client, current, maker = org_client
    # User A creates org
    current["token"] = _token("sub-a", "a@example.com")
    await client.post("/api/v1/users/sync")
    r = await client.post(
        "/api/v1/organizations",
        json={"name": "Org A", "slug": "org-a"},
    )
    org_a_id = r.json()["organization"]["id"]

    # User B creates org and cannot see Org A
    current["token"] = _token("sub-b", "b@example.com")
    await client.post("/api/v1/users/sync")
    r2 = await client.post(
        "/api/v1/organizations",
        json={"name": "Org B", "slug": "org-b"},
    )
    assert r2.status_code == 201
    denied = await client.get(f"/api/v1/organizations/{org_a_id}")
    assert denied.status_code == 404
    denied_members = await client.get(f"/api/v1/organizations/{org_a_id}/members")
    assert denied_members.status_code == 404


@pytest.mark.asyncio
async def test_add_and_remove_member(org_client):
    client, current, maker = org_client
    current["token"] = _token("sub-a", "a@example.com")
    await client.post("/api/v1/users/sync")
    org = (
        await client.post(
            "/api/v1/organizations", json={"name": "Team", "slug": "team-1"}
        )
    ).json()
    org_id = org["organization"]["id"]

    current["token"] = _token("sub-b", "b@example.com")
    sync_b = await client.post("/api/v1/users/sync")
    user_b_id = sync_b.json()["id"]

    current["token"] = _token("sub-a", "a@example.com")
    add = await client.post(
        f"/api/v1/organizations/{org_id}/members",
        json={"user_id": user_b_id, "role": "member"},
    )
    assert add.status_code == 201, add.text

    current["token"] = _token("sub-b", "b@example.com")
    ok = await client.get(f"/api/v1/organizations/{org_id}")
    assert ok.status_code == 200

    current["token"] = _token("sub-a", "a@example.com")
    removed = await client.delete(f"/api/v1/organizations/{org_id}/members/{user_b_id}")
    assert removed.status_code == 200

    current["token"] = _token("sub-b", "b@example.com")
    gone = await client.get(f"/api/v1/organizations/{org_id}")
    assert gone.status_code == 404

    async with maker() as session:
        events = (
            await session.exec(
                select(AuditEvent).where(AuditEvent.action == "organization.member.add")
            )
        ).all()
        assert len(events) >= 1
