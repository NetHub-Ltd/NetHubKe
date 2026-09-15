"""Unit tests for Tawala token minting (M2)."""
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


def _settings(pem: str, **over):
    m = MagicMock()
    m.tawala_exchange_enabled = True
    m.tawala_jwt_private_key = pem
    m.tawala_jwt_issuer = "https://api.nethub.test"
    m.tawala_jwt_audience = "tawala-api"
    m.tawala_jwt_ttl_sec = 3600
    for k, v in over.items():
        setattr(m, k, v)
    return m


def test_jwks_contains_rsa(rsa_pem):
    pem, _ = rsa_pem
    with patch.object(tt, "settings", _settings(pem)):
        jwks = tt.get_jwks()
    assert len(jwks["keys"]) == 1
    assert jwks["keys"][0]["kty"] == "RSA"
    assert jwks["keys"][0]["kid"] == "nethub-tawala-1"


def test_mint_and_verify(rsa_pem):
    pem, key = rsa_pem
    org = uuid4()
    with patch.object(tt, "settings", _settings(pem)):
        token, exp = tt.mint_tawala_access_token(
            sub="kc-sub",
            org_id=org,
            principal="owner",
            email="a@b.com",
        )
    assert exp > int(time.time())
    payload = jwt.decode(
        token,
        key.public_key(),
        algorithms=["RS256"],
        audience="tawala-api",
        issuer="https://api.nethub.test",
    )
    assert payload["org_id"] == str(org)
    assert payload["principal"] == "owner"
    assert payload["sub"] == "kc-sub"
    assert payload["email"] == "a@b.com"


def test_mint_disabled(rsa_pem):
    pem, _ = rsa_pem
    with patch.object(tt, "settings", _settings(pem, tawala_exchange_enabled=False)):
        with pytest.raises(Exception):
            tt.mint_tawala_access_token(
                sub="x", org_id=uuid4(), principal="terminal"
            )
