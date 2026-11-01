"""Ops signing-key endpoints require auth."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_rotate_requires_auth(client: AsyncClient):
    r = await client.post("/api/v1/ops/signing-keys/rotate", json={"retire_after_hours": 24})
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_prune_requires_auth(client: AsyncClient):
    r = await client.post("/api/v1/ops/signing-keys/prune")
    assert r.status_code in (401, 403)


@pytest.mark.asyncio
async def test_emergency_revoke_requires_auth(client: AsyncClient):
    response = await client.post("/api/v1/ops/signing-keys/compromised-kid/emergency-revoke")
    assert response.status_code in (401, 403)


@pytest.mark.asyncio
async def test_identity_link_requires_verified_proof_and_audits_hashed_subject(monkeypatch):
    from types import SimpleNamespace
    from unittest.mock import AsyncMock, MagicMock
    from uuid import uuid4

    from app.api.v1.routes import ops_keys
    from app.db.models.models import SecurityAuditEvent, UserIdentity
    from app.db.schemas.schemas import TokenData

    user_id = uuid4()
    subject = "immutable-upstream-subject"
    proof = SimpleNamespace(
        issuer=ops_keys.settings.idp_issuer,
        sub=subject,
        email="existing@example.com",
        email_verified=True,
    )
    monkeypatch.setattr(ops_keys, "_decode_token", lambda _token: proof)

    user_result = MagicMock()
    user_result.first.return_value = SimpleNamespace(
        id=user_id,
        email="existing@example.com",
    )
    identity_result = MagicMock()
    identity_result.first.return_value = None
    db = MagicMock()
    db.exec = AsyncMock(side_effect=[user_result, identity_result, identity_result])
    db.commit = AsyncMock()
    db.add = MagicMock()

    actor = TokenData(
        sub="admin-sub",
        issuer=ops_keys.settings.idp_issuer,
        email="admin@example.com",
        roles=["ops"],
        scopes=["identity:link"],
    )
    response = await ops_keys.ops_link_upstream_identity(
        ops_keys.LinkIdentityBody(proof_token="signed-proof-token", user_id=str(user_id)),
        db,
        actor,
    )

    assert response == {"linked": True, "user_id": str(user_id), "already_linked": False}
    linked = next(item for item in db.add.call_args_list[0].args if isinstance(item, UserIdentity))
    audit = next(item for call in db.add.call_args_list for item in call.args if isinstance(item, SecurityAuditEvent))
    assert linked.issuer == proof.issuer
    assert linked.subject == subject
    assert audit.details["subject_sha256"]
    assert "subject" not in audit.details
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_identity_link_rejects_unverified_email(monkeypatch):
    from types import SimpleNamespace
    from unittest.mock import AsyncMock, MagicMock
    from uuid import uuid4

    from fastapi import HTTPException
    from app.api.v1.routes import ops_keys
    from app.db.schemas.schemas import TokenData

    monkeypatch.setattr(
        ops_keys,
        "_decode_token",
        lambda _token: SimpleNamespace(
            issuer=ops_keys.settings.idp_issuer,
            sub="subject",
            email="existing@example.com",
            email_verified=False,
        ),
    )
    db = MagicMock()
    actor = TokenData(
        sub="admin-sub",
        issuer=ops_keys.settings.idp_issuer,
        email="admin@example.com",
        roles=["admin"],
        scopes=["identity:link"],
    )
    with pytest.raises(HTTPException) as error:
        await ops_keys.ops_link_upstream_identity(
            ops_keys.LinkIdentityBody(proof_token="signed-proof-token", user_id=str(uuid4())),
            db,
            actor,
        )
    assert error.value.status_code == 403
    db.exec.assert_not_called()


@pytest.mark.asyncio
async def test_identity_link_requires_dedicated_scope_at_http_boundary(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode
):
    from app.core.config import settings
    from app.db.models.models import User, UserIdentity

    actor = User(
        username="ops-admin",
        email="ops-admin@example.com",
        full_name="Ops Admin",
        is_active=True,
    )
    db_session.add(actor)
    await db_session.flush()
    db_session.add(
        UserIdentity(
            issuer=settings.idp_issuer.rstrip("/"),
            subject="ops-admin-subject",
            user_id=actor.id,
        )
    )
    await db_session.commit()

    token = make_kc_token(
        sub="ops-admin-subject",
        email="ops-admin@example.com",
        scopes="openid profile email user:write",
        roles=["admin"],
    )
    response = await client.post(
        "/api/v1/ops/identities/link",
        json={"proof_token": "not-reached", "user_id": str(actor.id)},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_identity_link_requires_admin_role_even_with_scope(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode
):
    from app.core.config import settings
    from app.db.models.models import User, UserIdentity

    actor = User(
        username="ordinary-user",
        email="ordinary-user@example.com",
        full_name="Ordinary User",
        is_active=True,
    )
    db_session.add(actor)
    await db_session.flush()
    db_session.add(
        UserIdentity(
            issuer=settings.idp_issuer.rstrip("/"),
            subject="ordinary-user-subject",
            user_id=actor.id,
        )
    )
    await db_session.commit()

    token = make_kc_token(
        sub="ordinary-user-subject",
        email="ordinary-user@example.com",
        scopes="openid profile email identity:link",
        roles=["user"],
    )
    response = await client.post(
        "/api/v1/ops/identities/link",
        json={"proof_token": "not-reached", "user_id": str(actor.id)},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_identity_link_succeeds_over_http_with_scope_role_and_verified_proof(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode, monkeypatch
):
    from types import SimpleNamespace

    from app.api.v1.routes import ops_keys
    from app.core.config import settings
    from app.db.models.models import SecurityAuditEvent, User, UserIdentity
    from sqlmodel import select

    actor = User(
        username="link-admin",
        email="link-admin@example.com",
        full_name="Link Admin",
        is_active=True,
    )
    target = User(
        username="existing-account",
        email="existing-account@example.com",
        full_name="Existing Account",
        is_active=True,
    )
    db_session.add(actor)
    db_session.add(target)
    await db_session.flush()
    db_session.add(
        UserIdentity(
            issuer=settings.idp_issuer.rstrip("/"),
            subject="link-admin-subject",
            user_id=actor.id,
        )
    )
    await db_session.commit()

    proof = SimpleNamespace(
        issuer=settings.idp_issuer,
        sub="new-upstream-subject",
        email="existing-account@example.com",
        email_verified=True,
    )
    monkeypatch.setattr(ops_keys, "_decode_token", lambda _token: proof)
    token = make_kc_token(
        sub="link-admin-subject",
        email="link-admin@example.com",
        scopes="openid profile email identity:link",
        roles=["ops"],
    )
    response = await client.post(
        "/api/v1/ops/identities/link",
        json={"proof_token": "valid-proof-token", "user_id": str(target.id)},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["linked"] is True

    linked = (
        await db_session.exec(
            select(UserIdentity).where(
                UserIdentity.issuer == settings.idp_issuer.rstrip("/"),
                UserIdentity.subject == "new-upstream-subject",
            )
        )
    ).first()
    audit = (
        await db_session.exec(
            select(SecurityAuditEvent).where(SecurityAuditEvent.action == "identity.link")
        )
    ).first()
    assert linked is not None and linked.user_id == target.id
    assert audit is not None
    assert audit.details["subject_sha256"]
    assert "subject" not in audit.details


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("POST", "/api/v1/ops/signing-keys/rotate"),
        ("POST", "/api/v1/ops/signing-keys/prune"),
        ("POST", "/api/v1/ops/signing-keys/compromised-kid/emergency-revoke"),
        ("GET", "/api/v1/ops/signing-keys/jwks-preview"),
    ],
)
async def test_signing_key_operations_require_admin_or_ops_role(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode, method: str, path: str
):
    await _persist_signing_key_test_identity(db_session, "ordinary-operator")
    token = make_kc_token(
        sub="ordinary-operator",
        scopes="openid profile email user:read user:write",
        roles=["user"],
    )
    response = await client.request(
        method,
        path,
        json={"retire_after_hours": 24} if method == "POST" and path.endswith("/rotate") else None,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
@pytest.mark.parametrize(
    ("method", "path"),
    [
        ("POST", "/api/v1/ops/signing-keys/rotate"),
        ("POST", "/api/v1/ops/signing-keys/prune"),
        ("POST", "/api/v1/ops/signing-keys/compromised-kid/emergency-revoke"),
    ],
)
async def test_signing_key_mutations_require_write_scope(
    client: AsyncClient, db_session, make_kc_token, patch_kc_decode, method: str, path: str
):
    await _persist_signing_key_test_identity(db_session, "ops-without-write-scope")
    token = make_kc_token(
        sub="ops-without-write-scope",
        scopes="openid profile email user:read",
        roles=["ops"],
    )
    response = await client.request(
        method,
        path,
        json={"retire_after_hours": 24} if path.endswith("/rotate") else None,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403


async def _persist_signing_key_test_identity(db_session, subject: str) -> None:
    """Create the canonical local identity required by authenticated ops routes."""
    from app.core.config import settings
    from app.db.models.models import User, UserIdentity

    user = User(
        username=subject,
        email=f"{subject}@example.test",
        full_name="Signing Key Operator",
        is_active=True,
    )
    db_session.add(user)
    await db_session.flush()
    db_session.add(UserIdentity(
        issuer=settings.idp_issuer.rstrip("/"),
        subject=subject,
        user_id=user.id,
    ))
    await db_session.commit()
