"""N2 regression tests for managed signing-key lifecycle and JWKS reliability."""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from app.services import tawala_token as tt


@pytest.fixture
def rsa_pem():
    _, pem, _, key = tt._generate_rsa_keypair()
    return pem, key


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



def test_private_key_encryption_round_trip(rsa_pem):
    from cryptography.fernet import Fernet

    pem, _ = rsa_pem
    key = Fernet.generate_key().decode("ascii")
    with patch.object(
        tt, "settings",
        MagicMock(environment="development", signing_key_encryption_key=key),
    ):
        protected = tt._protect_private_pem(pem)
        assert protected.startswith("enc:v1:")
        assert pem not in protected
        assert tt._unprotect_private_pem(protected) == pem


def test_production_refuses_legacy_plaintext_key(rsa_pem):
    pem, _ = rsa_pem
    from cryptography.fernet import Fernet

    key = Fernet.generate_key().decode("ascii")
    with patch.object(
        tt, "settings",
        MagicMock(environment="production", signing_key_encryption_key=key),
    ):
        with pytest.raises(HTTPException) as error:
            tt._unprotect_private_pem(pem)
    assert error.value.status_code == 503


@pytest.mark.asyncio
async def test_jwks_cache_miss_uses_configured_ttl():
    db = AsyncMock()
    row = MagicMock(status="active", retire_after=None, public_jwk={
        "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "durable", "n": "AQ", "e": "AQAB"
    })
    db.exec = AsyncMock(return_value=_result([row]))
    cache_set = AsyncMock()
    with (
        patch.object(tt, "exchange_enabled", return_value=False),
        patch.object(tt, "ensure_fresh_signing_key", new_callable=AsyncMock),
        patch.object(tt, "redis_get", new_callable=AsyncMock, return_value=None),
        patch.object(tt, "redis_set", cache_set),
        patch.object(tt, "settings", MagicMock(jwks_redis_ttl_sec=17)),
    ):
        document = await tt.build_jwks_document(db)
    assert document["keys"][0]["kid"] == "durable"
    cache_set.assert_awaited_once()
    assert cache_set.await_args.args[0] == tt.JWKS_CACHE_KEY
    assert cache_set.await_args.args[2] == 17


@pytest.mark.asyncio
async def test_bootstrap_rechecks_active_key_after_acquiring_lock():
    existing = MagicMock(kid="already-active", status="active")
    db = AsyncMock()
    db.exec = AsyncMock(side_effect=[MagicMock(), _result([existing])])
    result = await tt.bootstrap_signing_key(db)
    assert result is existing
    db.add.assert_not_called()
    db.commit.assert_not_awaited()


@pytest.mark.asyncio
async def test_jwks_ignores_stale_cached_document_after_revocation():
    """A stale Redis value must not resurrect a key removed from PostgreSQL."""
    db = AsyncMock()
    current = MagicMock(status="active", retire_after=None, public_jwk={
        "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "replacement", "n": "AQ", "e": "AQAB"
    })
    db.exec = AsyncMock(return_value=_result([current]))
    stale = json.dumps({"keys": [{
        "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "compromised", "n": "Ag", "e": "AQAB"
    }]})
    with (
        patch.object(tt, "exchange_enabled", return_value=False),
        patch.object(tt, "ensure_fresh_signing_key", new_callable=AsyncMock),
        patch.object(tt, "redis_get", new_callable=AsyncMock, return_value=stale) as cache_get,
        patch.object(tt, "redis_set", new_callable=AsyncMock),
    ):
        document = await tt.build_jwks_document(db)
    assert [key["kid"] for key in document["keys"]] == ["replacement"]
    cache_get.assert_not_awaited()


@pytest.mark.asyncio
async def test_product_token_lifetime_is_hard_capped_at_four_minutes(monkeypatch):
    """A legacy eight-hour environment value cannot violate the freshness budget."""
    import jwt as pyjwt

    _, _, _, private_key = tt._generate_rsa_keypair()
    monkeypatch.setattr(tt, "exchange_enabled", lambda: True)
    monkeypatch.setattr(tt, "get_active_signing_key", AsyncMock(return_value=(private_key, "test-kid")))
    monkeypatch.setattr(tt, "settings", MagicMock(tawala_jwt_ttl_sec=28800, tawala_jwt_issuer="https://issuer.test"))
    token, expires_at = await tt.mint_product_access_token(
        AsyncMock(), product_slug="example", audience="example-api",
        sub="user-1", org_id=None, principal="user", claim_profile="standard",
    )
    claims = pyjwt.decode(token, private_key.public_key(), algorithms=["RS256"], audience="example-api", issuer="https://issuer.test")
    assert expires_at - claims["iat"] == 240
