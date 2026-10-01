"""Signing key rotation helpers (unit-level, no DB)."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.services.tawala_token import _generate_rsa_keypair, public_jwk_from_private
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
