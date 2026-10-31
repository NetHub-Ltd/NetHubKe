"""HTTP acceptance tests for canonical identity lifecycle (N3)."""
from __future__ import annotations

from datetime import datetime, timezone

import pytest
from httpx import AsyncClient

from app.core.config import settings
from app.db.models.models import User, UserIdentity


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
