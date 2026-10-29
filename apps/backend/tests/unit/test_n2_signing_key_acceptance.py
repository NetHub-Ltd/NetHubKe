"""N2 regression tests for managed signing-key lifecycle and JWKS reliability."""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from app.services import tawala_token as tt


def _result(rows):
    result = MagicMock()
    result.__iter__ = lambda self: iter(rows)
    result.first = MagicMock(return_value=rows[0] if rows else None)
    return result


@pytest.mark.asyncio
async def test_disabled_exchange_does_not_bootstrap_missing_key():
    db = AsyncMock()
    db.exec = AsyncMock(return_value=_result([]))
    with patch.object(tt, "exchange_enabled", return_value=False):
        with pytest.raises(HTTPException) as error:
            await tt.ensure_signing_keys_ready(db)
    assert error.value.status_code == 503
    db.add.assert_not_called()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_jwks_no_key_and_exchange_disabled_returns_empty_without_bootstrap():
    db = AsyncMock()
    db.exec = AsyncMock(return_value=_result([]))
    with (
        patch.object(tt, "exchange_enabled", return_value=False),
        patch.object(tt, "ensure_fresh_signing_key", new_callable=AsyncMock),
        patch.object(tt, "redis_get", new_callable=AsyncMock, return_value=None),
        patch.object(tt, "redis_set", new_callable=AsyncMock),
    ):
        document = await tt.build_jwks_document(db)
    assert document == {"keys": []}
    db.add.assert_not_called()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_jwks_excludes_expired_retiring_and_retired_keys():
    db = AsyncMock()
    now = datetime.now(timezone.utc)
    active = MagicMock(status="active", retire_after=None, public_jwk={
        "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "active", "n": "AQ", "e": "AQAB"
    })
    retiring = MagicMock(status="retiring", retire_after=now + timedelta(hours=1), public_jwk={
        "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "retiring", "n": "Ag", "e": "AQAB"
    })
    expired = MagicMock(status="retiring", retire_after=now - timedelta(seconds=1), public_jwk={
        "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "expired", "n": "Aw", "e": "AQAB"
    })
    retired = MagicMock(status="retired", retire_after=None, public_jwk={
        "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "retired", "n": "BA", "e": "AQAB"
    })
    db.exec = AsyncMock(return_value=_result([active, retiring, expired, retired]))
    with (
        patch.object(tt, "exchange_enabled", return_value=False),
        patch.object(tt, "ensure_fresh_signing_key", new_callable=AsyncMock),
        patch.object(tt, "redis_get", new_callable=AsyncMock, return_value=None),
        patch.object(tt, "redis_set", new_callable=AsyncMock),
    ):
        document = await tt.build_jwks_document(db)
    assert {key["kid"] for key in document["keys"]} == {"active", "retiring"}


def test_sanitize_jwks_rejects_duplicate_kids_and_non_public_or_malformed_values():
    safe = {"kty": "RSA", "use": "sig", "alg": "RS256", "kid": "one", "n": "AQ", "e": "AQAB"}
    raw = [
        {**safe, "d": "private"},
        {**safe, "n": "different"},
        {**safe, "kid": "bad", "n": ""},
        {**safe, "kid": "hs", "alg": "HS256"},
        {**safe, "kid": "not-rsa", "kty": "EC"},
    ]
    result = tt._sanitize_public_jwks(raw)
    assert len(result) == 1
    assert result[0]["kid"] == "one"
    assert set(result[0]) == {"kty", "use", "alg", "kid", "n", "e"}


@pytest.mark.asyncio
async def test_malformed_cached_jwks_falls_back_to_database():
    db = AsyncMock()
    db.exec = AsyncMock(return_value=_result([]))
    with (
        patch.object(tt, "exchange_enabled", return_value=False),
        patch.object(tt, "ensure_fresh_signing_key", new_callable=AsyncMock),
        patch.object(tt, "redis_get", new_callable=AsyncMock, return_value="{not-json"),
        patch.object(tt, "redis_set", new_callable=AsyncMock),
    ):
        document = await tt.build_jwks_document(db)
    assert document == {"keys": []}
    db.exec.assert_awaited()


def test_private_key_storage_policy_is_explicit_and_production_fails_closed():
    """Plaintext PEM rows must not be accepted as production-safe key custody."""
    with patch.object(
        tt,
        "settings",
        MagicMock(environment="production", signing_key_encryption_key=""),
    ):
        with pytest.raises(HTTPException) as error:
            tt._require_signing_key_encryption()
    assert error.value.status_code == 503
