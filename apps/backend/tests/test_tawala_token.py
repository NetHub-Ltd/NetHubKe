"""Unit tests for signing helpers (N2) — no DB/Redis required for pure crypto paths."""
from __future__ import annotations

import time
from unittest.mock import MagicMock, patch
from uuid import uuid4

import jwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from app.services import tawala_token as tt


@pytest.fixture(scope="module")
def rsa_pem():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode()
    return pem, key


def test_public_jwk_from_private(rsa_pem):
    pem, key = rsa_pem
    jwk = tt.public_jwk_from_private(key, "kid-1")
    assert jwk["kty"] == "RSA"
    assert jwk["kid"] == "kid-1"
    assert jwk["alg"] == "RS256"
    assert "n" in jwk and "e" in jwk


def test_get_jwks_env_fallback(rsa_pem):
    pem, key = rsa_pem
    settings = MagicMock()
    settings.tawala_jwt_private_key = pem
    with patch.object(tt, "settings", settings):
        doc = tt.get_jwks()
    assert len(doc["keys"]) == 1
    assert doc["keys"][0]["kid"] == "nethub-env-bootstrap"


def test_get_jwks_empty_without_env():
    settings = MagicMock()
    settings.tawala_jwt_private_key = ""
    with patch.object(tt, "settings", settings):
        assert tt.get_jwks() == {"keys": []}


def test_generate_rsa_keypair_roundtrip():
    kid, pem, jwk, key = tt._generate_rsa_keypair()
    assert kid.startswith("nethub-")
    assert "BEGIN PRIVATE KEY" in pem
    assert jwk["kid"] == kid
    # sign/verify
    token = jwt.encode({"sub": "x", "exp": int(time.time()) + 60}, key, algorithm="RS256", headers={"kid": kid})
    payload = jwt.decode(token, key.public_key(), algorithms=["RS256"])
    assert payload["sub"] == "x"


def test_exchange_enabled_flag():
    with patch.object(tt, "settings", MagicMock(tawala_exchange_enabled=True)):
        assert tt.exchange_enabled() is True
    with patch.object(tt, "settings", MagicMock(tawala_exchange_enabled=False)):
        assert tt.exchange_enabled() is False
