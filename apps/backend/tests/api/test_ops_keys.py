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
        scopes=["user:write"],
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
        scopes=["user:write"],
    )
    with pytest.raises(HTTPException) as error:
        await ops_keys.ops_link_upstream_identity(
            ops_keys.LinkIdentityBody(proof_token="signed-proof-token", user_id=str(uuid4())),
            db,
            actor,
        )
    assert error.value.status_code == 403
    db.exec.assert_not_awaited()
