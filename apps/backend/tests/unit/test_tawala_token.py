"""Signing / JWKS / exchange helpers (unit, mocked DB/Redis where needed)."""
from __future__ import annotations

import json
import time
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import jwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException

from app.services import tawala_token as tt


@pytest.fixture
def rsa_pem():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()
    return pem, key


def test_public_jwk(rsa_pem):
    _, key = rsa_pem
    jwk = tt.public_jwk_from_private(key, "kid-x")
    assert jwk["kid"] == "kid-x"
    assert jwk["kty"] == "RSA"
    assert jwk["alg"] == "RS256"
    assert "n" in jwk and "e" in jwk


def test_get_jwks_env(rsa_pem):
    pem, _ = rsa_pem
    s = MagicMock(tawala_jwt_private_key=pem, tawala_jwt_allow_env_pem=True)
    with patch.object(tt, "settings", s):
        doc = tt.get_jwks()
    assert len(doc["keys"]) == 1
    assert doc["keys"][0]["kid"] == "nethub-env-bootstrap"


def test_get_jwks_empty():
    with patch.object(tt, "settings", MagicMock(tawala_jwt_private_key="")):
        assert tt.get_jwks() == {"keys": []}


def test_generate_keypair_sign():
    kid, pem, jwk, key = tt._generate_rsa_keypair()
    token = jwt.encode({"sub": "s", "exp": int(time.time()) + 60}, key, algorithm="RS256")
    jwt.decode(token, key.public_key(), algorithms=["RS256"])
    assert jwk["kid"] == kid
    assert "BEGIN" in pem


def test_exchange_enabled_false():
    with patch.object(tt, "settings", MagicMock(tawala_exchange_enabled=False)):
        assert tt.exchange_enabled() is False


def test_exchange_enabled_true():
    with patch.object(tt, "settings", MagicMock(tawala_exchange_enabled=True)):
        assert tt.exchange_enabled() is True


def test_load_env_private_key_empty():
    with patch.object(
        tt, "settings", MagicMock(tawala_jwt_private_key="", tawala_jwt_allow_env_pem=True)
    ):
        assert tt._load_env_private_key() is None


def test_load_env_private_key_valid(rsa_pem):
    pem, _ = rsa_pem
    with patch.object(
        tt,
        "settings",
        MagicMock(tawala_jwt_private_key=pem, tawala_jwt_allow_env_pem=True),
    ):
        key = tt._load_env_private_key()
    assert key is not None


def test_load_env_private_key_blocked_without_allow(rsa_pem):
    pem, _ = rsa_pem
    with patch.object(
        tt,
        "settings",
        MagicMock(tawala_jwt_private_key=pem, tawala_jwt_allow_env_pem=False),
    ):
        assert tt._load_env_private_key() is None


@pytest.mark.asyncio
async def test_invalidate_jwks_cache():
    with patch.object(tt, "redis_delete", new_callable=AsyncMock) as m:
        await tt.invalidate_jwks_cache()
        m.assert_awaited()


@pytest.mark.asyncio
async def test_mint_disabled():
    db = AsyncMock()
    with patch.object(tt, "exchange_enabled", return_value=False):
        with pytest.raises(HTTPException) as ei:
            await tt.mint_tawala_access_token(
                db, sub="s", org_id=uuid.uuid4(), principal="owner"
            )
    assert ei.value.status_code == 503


@pytest.mark.asyncio
async def test_mint_bad_principal():
    db = AsyncMock()
    with patch.object(tt, "exchange_enabled", return_value=True):
        with pytest.raises(HTTPException) as ei:
            await tt.mint_tawala_access_token(
                db, sub="s", org_id=uuid.uuid4(), principal="admin"
            )
    assert ei.value.status_code == 400


@pytest.mark.asyncio
async def test_build_jwks_from_cache():
    db = AsyncMock()
    cached = json.dumps({"keys": [{
        "kty": "RSA", "use": "sig", "alg": "RS256",
        "kid": "c", "n": "modulus", "e": "AQAB",
    }]})
    with patch.object(tt, "ensure_fresh_signing_key", new_callable=AsyncMock):
        with patch.object(tt, "redis_get", new_callable=AsyncMock, return_value=cached):
            doc = await tt.build_jwks_document(db)
    assert doc["keys"][0]["kid"] == "c"


@pytest.mark.asyncio
async def test_build_jwks_empty_db_env_fallback(rsa_pem):
    pem, _ = rsa_pem
    db = AsyncMock()
    result = MagicMock()
    result.__iter__ = lambda self: iter([])
    result.first = MagicMock(return_value=None)
    db.exec = AsyncMock(return_value=result)
    with patch.object(tt, "ensure_fresh_signing_key", new_callable=AsyncMock):
        with patch.object(tt, "redis_get", new_callable=AsyncMock, return_value=None):
            with patch.object(tt, "redis_set", new_callable=AsyncMock):
                with patch.object(
                    tt,
                    "settings",
                    MagicMock(
                        tawala_jwt_private_key=pem,
                        tawala_jwt_allow_env_pem=True,
                        tawala_exchange_enabled=False,
                        jwks_redis_ttl_sec=60,
                    ),
                ):
                    doc = await tt.build_jwks_document(db)
    assert len(doc["keys"]) == 1


@pytest.mark.asyncio
async def test_build_jwks_from_db_rows():
    db = AsyncMock()
    row = MagicMock()
    row.status = "active"
    row.retire_after = None
    row.public_jwk = {
        "kid": "db-kid", "kty": "RSA", "use": "sig", "alg": "RS256",
        "n": "modulus", "e": "AQAB", "d": "MUST_NOT_LEAK",
    }
    result = MagicMock()
    result.__iter__ = lambda self: iter([row])
    result.first = MagicMock(return_value=None)
    db.exec = AsyncMock(return_value=result)
    with patch.object(tt, "ensure_fresh_signing_key", new_callable=AsyncMock):
        with patch.object(tt, "redis_get", new_callable=AsyncMock, return_value=None):
            with patch.object(tt, "redis_set", new_callable=AsyncMock):
                doc = await tt.build_jwks_document(db)
    assert doc["keys"][0]["kid"] == "db-kid"
    assert "d" not in doc["keys"][0]
    assert set(doc["keys"][0]) <= {"kty", "use", "alg", "kid", "n", "e"}


@pytest.mark.asyncio
async def test_get_active_signing_key_from_row(rsa_pem):
    pem, key = rsa_pem
    db = AsyncMock()
    row = MagicMock()
    row.kid = "active-1"
    row.private_pem = pem
    result = MagicMock()
    result.first = MagicMock(return_value=row)
    db.exec = AsyncMock(return_value=result)
    with patch.object(tt, "ensure_fresh_signing_key", new_callable=AsyncMock):
        with patch.object(tt, "redis_set", new_callable=AsyncMock):
            priv, kid = await tt.get_active_signing_key(db)
    assert kid == "active-1"
    assert priv is not None


@pytest.mark.asyncio
async def test_mint_product_success(rsa_pem):
    pem, key = rsa_pem
    db = AsyncMock()
    with patch.object(tt, "exchange_enabled", return_value=True):
        with patch.object(
            tt, "get_active_signing_key", new_callable=AsyncMock, return_value=(key, "kid-1")
        ):
            with patch.object(
                tt,
                "settings",
                MagicMock(tawala_jwt_issuer="http://iss", tawala_jwt_ttl_sec=60),
            ):
                token, exp = await tt.mint_product_access_token(
                    db,
                    product_slug="tawala",
                    audience="tawala-api",
                    sub="sub-1",
                    org_id=uuid.uuid4(),
                    principal="owner",
                    email="a@example.com",
                )
    assert isinstance(token, str) and len(token) > 20
    assert exp > int(time.time())



@pytest.mark.asyncio
async def test_mint_product_success_token_claims_and_signature(rsa_pem):
    """Minted product JWT is RS256-signed, audience-bound and exposes no private key material."""
    _, key = rsa_pem
    db = AsyncMock()
    org_id = uuid.uuid4()
    now = int(time.time())
    with patch.object(tt, "exchange_enabled", return_value=True):
        with patch.object(
            tt, "get_active_signing_key", new_callable=AsyncMock, return_value=(key, "kid-verified")
        ):
            with patch.object(
                tt,
                "settings",
                MagicMock(tawala_jwt_issuer="https://api.example.test", tawala_jwt_ttl_sec=60),
            ):
                token, exp = await tt.mint_product_access_token(
                    db,
                    product_slug="netpay",
                    audience="netpay-api",
                    sub="canonical-user-123",
                    org_id=org_id,
                    principal="terminal",
                    email="user@example.com",
                )

    header = jwt.get_unverified_header(token)
    assert header["alg"] == "RS256"
    assert header["kid"] == "kid-verified"
    claims = jwt.decode(
        token,
        key.public_key(),
        algorithms=["RS256"],
        audience="netpay-api",
        issuer="https://api.example.test",
    )
    assert claims["sub"] == "canonical-user-123"
    assert claims["org_id"] == str(org_id)
    assert claims["principal"] == "terminal"
    assert claims["product"] == "netpay"
    assert claims["iat"] >= now
    assert claims["exp"] == exp
    assert 0 < claims["exp"] - claims["iat"] <= 60
    assert claims["email"] == "user@example.com"
    assert not ({"password", "private_pem", "private_key", "roles", "tenant_id"} & claims.keys())


@pytest.mark.asyncio
async def test_mint_rejects_unknown_principal_without_loading_key():
    db = AsyncMock()
    with patch.object(tt, "exchange_enabled", return_value=True):
        with patch.object(tt, "get_active_signing_key", new_callable=AsyncMock) as get_key:
            with pytest.raises(HTTPException) as error:
                await tt.mint_product_access_token(
                    db,
                    product_slug="tawala",
                    audience="tawala-api",
                    sub="sub-1",
                    org_id=uuid.uuid4(),
                    principal="admin",
                )
    assert error.value.status_code == 400
    get_key.assert_not_awaited()


def test_sanitize_public_jwks_filters_private_fields_and_duplicate_kids():
    raw_keys = [
        {
            "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "same",
            "n": "modulus", "e": "AQAB", "d": "private",
        },
        {
            "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "same",
            "n": "different-modulus", "e": "AQAB",
        },
        {
            "kty": "RSA", "use": "sig", "alg": "RS256", "kid": "missing-modulus",
            "e": "AQAB", "d": "private",
        },
        {
            "kty": "RSA", "use": "sig", "alg": "HS256", "kid": "wrong-alg",
            "n": "modulus", "e": "AQAB",
        },
    ]
    result = tt._sanitize_public_jwks(raw_keys)
    assert len(result) == 1
    assert result[0]["kid"] == "same"
    assert set(result[0]) == {"kty", "use", "alg", "kid", "n", "e"}
