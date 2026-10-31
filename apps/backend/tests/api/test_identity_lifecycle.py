"""HTTP acceptance tests for canonical identity lifecycle (N3)."""
from __future__ import annotations

import asyncio
from datetime import datetime, timezone

import pytest
from httpx import AsyncClient
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.config import settings
from app.crud.user import user_crud
from app.db.models.models import Tenant, User, UserIdentity
from app.db.schemas.schemas import TokenData



async def _create_identity(db_session, *, sub: str, email: str, active: bool = True, deleted_at=None):
    user = User(
        username=email.split("@")[0],
        email=email,
        full_name="Lifecycle User",
        is_active=active,
        deleted_at=deleted_at,
    )
    db_session.add(user)
    await db_session.flush()
    db_session.add(
        UserIdentity(issuer=settings.idp_issuer.rstrip("/"), subject=sub, user_id=user.id)
    )
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.mark.asyncio
async def test_me_resolves_identity_after_upstream_email_change(client: AsyncClient, db_session, make_kc_token, patch_kc_decode):
    user = await _create_identity(db_session, sub="stable-subject-1", email="old@example.com")
    token = make_kc_token(sub="stable-subject-1", email="new@example.com")
    response = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["id"] == str(user.id)
    assert response.json()["email"] == "old@example.com"


@pytest.mark.asyncio
async def test_sync_updates_email_for_verified_mapped_identity(client: AsyncClient, db_session, make_kc_token, patch_kc_decode):
    user = await _create_identity(db_session, sub="stable-subject-2", email="old@example.com")
    token = make_kc_token(sub="stable-subject-2", email="new@example.com")
    response = await client.post("/api/v1/users/sync", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["id"] == str(user.id)
    assert response.json()["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_sync_rejects_verified_email_owned_by_another_account(client: AsyncClient, db_session, make_kc_token, patch_kc_decode):
    await _create_identity(db_session, sub="stable-subject-3", email="first@example.com")
    await _create_identity(db_session, sub="stable-subject-4", email="claimed@example.com")
    token = make_kc_token(sub="stable-subject-3", email="claimed@example.com")
    response = await client.post("/api/v1/users/sync", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_soft_deleted_identity_cannot_authenticate(client: AsyncClient, db_session, make_kc_token, patch_kc_decode):
    await _create_identity(
        db_session,
        sub="deleted-subject",
        email="deleted@example.com",
        deleted_at=datetime.now(timezone.utc),
    )
    token = make_kc_token(sub="deleted-subject", email="deleted@example.com")
    response = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_sync_does_not_reactivate_disabled_identity(client: AsyncClient, db_session, make_kc_token, patch_kc_decode):
    user = await _create_identity(db_session, sub="disabled-subject", email="disabled@example.com", active=False)
    token = make_kc_token(sub="disabled-subject", email="disabled@example.com")
    response = await client.post("/api/v1/users/sync", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 403
    await db_session.refresh(user)
    assert user.is_active is False


@pytest.mark.asyncio
async def test_sync_ignores_unverified_email_change(
    client: AsyncClient, db_session, monkeypatch
):
    from app.api import deps
    from app.db.schemas.schemas import TokenData

    user = await _create_identity(
        db_session, sub="unverified-subject", email="verified-before@example.com"
    )
    claims = TokenData(
        sub="unverified-subject",
        issuer=settings.idp_issuer,
        email="attacker-controlled@example.com",
        email_verified=False,
        scopes=[],
    )
    monkeypatch.setattr(deps, "_decode_token", lambda _token: claims)
    response = await client.post(
        "/api/v1/users/sync",
        headers={"Authorization": "Bearer test-token"},
    )
    assert response.status_code == 200
    assert response.json()["id"] == str(user.id)
    assert response.json()["email"] == "verified-before@example.com"


@pytest.mark.asyncio
async def test_profile_patch_resolves_by_identity_after_email_change(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode
):
    user = await _create_identity(
        db_session, sub="stable-subject-patch", email="stored@example.com"
    )
    token = make_kc_token(
        sub="stable-subject-patch",
        email="upstream-renamed@example.com",
        scopes="openid profile email user:read user:write",
    )
    response = await client.patch(
        "/api/v1/users/me",
        json={"full_name": "Updated Through Stable Identity"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["id"] == str(user.id)
    assert response.json()["full_name"] == "Updated Through Stable Identity"
    assert response.json()["email"] == "stored@example.com"



@pytest.mark.asyncio
async def test_sync_refuses_email_only_linking_over_http(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode
):
    # A matching email is not proof that this upstream subject owns the account.
    existing = User(
        username="legacy-user",
        email="legacy@example.com",
        full_name="Legacy Account",
        is_active=True,
    )
    db_session.add(existing)
    await db_session.commit()

    token = make_kc_token(sub="unmapped-subject", email="legacy@example.com")
    response = await client.post(
        "/api/v1/users/sync",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 409
    assert "Explicitly link" in response.json()["detail"]
    identities = await db_session.exec(select(func.count()).select_from(UserIdentity))
    users = await db_session.exec(select(func.count()).select_from(User))
    tenants = await db_session.exec(select(func.count()).select_from(Tenant))
    assert identities.one() == 0
    assert users.one() == 1
    assert tenants.one() == 0


@pytest.mark.asyncio
@pytest.mark.integration
async def test_concurrent_first_sync_commits_one_tenant_user_and_identity(test_engine):
    # Exercise PostgreSQL uniqueness races with independent transactions/sessions.
    from sqlmodel.ext.asyncio.session import AsyncSession

    session_factory = async_sessionmaker(
        bind=test_engine, class_=AsyncSession, expire_on_commit=False, autoflush=False
    )
    claims = TokenData(
        sub="concurrent-first-login-subject",
        issuer=settings.idp_issuer,
        email="concurrent-first-login@example.com",
        username="concurrent-first-login",
        full_name="Concurrent First Login",
        email_verified=True,
    )

    async def provision():
        async with session_factory() as session:
            return await user_crud.get_or_create(session, claims)

    first, second = await asyncio.gather(provision(), provision())
    assert first.id == second.id

    async with session_factory() as session:
        user_count = await session.exec(select(func.count()).select_from(User))
        identity_count = await session.exec(select(func.count()).select_from(UserIdentity))
        tenant_count = await session.exec(select(func.count()).select_from(Tenant))
        assert user_count.one() == 1
        assert identity_count.one() == 1
        assert tenant_count.one() == 1
