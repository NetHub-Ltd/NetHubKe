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
    s = MagicMock(tawala_jwt_private_key=pem)
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
    with patch.object(tt, "settings", MagicMock(tawala_jwt_private_key="")):
        assert tt._load_env_private_key() is None


def test_load_env_private_key_valid(rsa_pem):
    pem, _ = rsa_pem
    with patch.object(tt, "settings", MagicMock(tawala_jwt_private_key=pem)):
        key = tt._load_env_private_key()
    assert key is not None


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
    cached = json.dumps({"keys": [{"kid": "c"}]})
    with patch.object(tt, "redis_get", new_callable=AsyncMock, return_value=cached):
        doc = await tt.build_jwks_document(db)
    assert doc["keys"][0]["kid"] == "c"


@pytest.mark.asyncio
async def test_build_jwks_empty_db_env_fallback(rsa_pem):
    pem, _ = rsa_pem
    db = AsyncMock()
    # exec returns empty list
    result = MagicMock()
    result.__iter__ = lambda self: iter([])
    db.exec = AsyncMock(return_value=result)
    with patch.object(tt, "redis_get", new_callable=AsyncMock, return_value=None):
        with patch.object(tt, "redis_set", new_callable=AsyncMock):
            with patch.object(tt, "settings", MagicMock(tawala_jwt_private_key=pem, jwks_redis_ttl_sec=60)):
                doc = await tt.build_jwks_document(db)
    assert len(doc["keys"]) == 1
