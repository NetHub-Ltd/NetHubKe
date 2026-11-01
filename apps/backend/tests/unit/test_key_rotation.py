"""Signing key rotation helpers (unit-level, no DB)."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.tawala_token import _generate_rsa_keypair, public_jwk_from_private
from app.db.models.models import SecurityAuditEvent
from app.services import tawala_token as tt


def test_generate_keypair_has_kid_and_jwk():
    kid, pem, jwk, key = _generate_rsa_keypair()
    assert kid.startswith("nethub-")
    assert "BEGIN PRIVATE KEY" in pem
    assert jwk["kid"] == kid
    assert jwk["kty"] == "RSA"
    assert public_jwk_from_private(key, kid)["n"] == jwk["n"]


@pytest.mark.asyncio
async def test_rotate_signing_key_marks_previous_retiring():
    db = AsyncMock()
    old = MagicMock()
    old.kid = "old"
    old.status = "active"
    result_active = MagicMock()
    result_active.__iter__ = lambda self: iter([old])
    db.exec = AsyncMock(return_value=result_active)
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    with patch.object(tt, "invalidate_jwks_cache", new_callable=AsyncMock):
        out = await tt.rotate_signing_key(db, retire_after_hours=12)
    assert "new_kid" in out
    assert out["retiring_kids"] == ["old"]
    assert old.status == "retiring"
    assert any(isinstance(call.args[0], SecurityAuditEvent) for call in db.add.call_args_list)


@pytest.mark.asyncio
async def test_prune_expired_retiring_keys():
    db = AsyncMock()
    expired = MagicMock()
    expired.status = "retiring"
    expired.retire_after = datetime.now(timezone.utc) - timedelta(hours=1)
    result = MagicMock()
    result.__iter__ = lambda self: iter([expired])
    db.exec = AsyncMock(return_value=result)
    db.add = MagicMock()
    db.commit = AsyncMock()
    with patch.object(tt, "invalidate_jwks_cache", new_callable=AsyncMock) as inv:
        n = await tt.prune_expired_retiring_keys(db)
    assert n == 1
    assert expired.status == "retired"
    inv.assert_awaited()


@pytest.mark.asyncio
async def test_emergency_revoke_active_key_replaces_and_audits():
    target = MagicMock(kid="compromised", status="active", deleted_at=None)
    target_result = MagicMock()
    target_result.first.return_value = target
    active_result = MagicMock()
    active_result.__iter__ = lambda self: iter([target])
    db = AsyncMock()
    db.exec = AsyncMock(side_effect=[MagicMock(), target_result, active_result])
    db.add = MagicMock()
    db.commit = AsyncMock()
    with patch.object(tt, "invalidate_jwks_cache", new_callable=AsyncMock) as invalidate:
        result = await tt.emergency_revoke_signing_key(
            db, kid="compromised", actor_sub="operator-sub"
        )
    assert target.status == "retired"
    assert result["status"] == "retired"
    assert result["replacement_kid"]
    assert any(isinstance(call.args[0], SecurityAuditEvent) for call in db.add.call_args_list)
    db.commit.assert_awaited_once()
    invalidate.assert_awaited_once()


@pytest.mark.asyncio
async def test_auto_rotation_rechecks_fresh_key_after_lock():
    """A competing worker's completed rotation makes this worker a no-op."""
    fresh = MagicMock(kid="fresh-key", status="active", deleted_at=None, created_at=datetime.now(timezone.utc))
    stale = MagicMock(kid="old-key", status="active", deleted_at=None, created_at=datetime.now(timezone.utc) - timedelta(days=10))
    empty = MagicMock()
    empty.__iter__ = lambda self: iter([])
    initial = MagicMock()
    initial.first.return_value = stale
    locked = MagicMock()
    locked.__iter__ = lambda self: iter([fresh])
    db = AsyncMock()
    db.exec = AsyncMock(side_effect=[empty, initial, MagicMock(), locked])
    with patch.object(tt, "settings", MagicMock(
        signing_key_max_age_hours=168, signing_key_retire_overlap_hours=24,
        signing_key_encryption_key="", environment="development",
    )):
        await tt.ensure_fresh_signing_key(db)
    assert not any(isinstance(call.args[0], SecurityAuditEvent) for call in db.add.call_args_list)
    db.commit.assert_not_awaited()
