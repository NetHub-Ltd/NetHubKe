"""Keycloak JWT decode unit tests with local RSA (no network)."""
from __future__ import annotations

import time
import uuid
from unittest.mock import MagicMock, patch

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException

from app.core import security as security_mod
from app.core.config import settings


@pytest.fixture
def rsa_key():
    return rsa.generate_private_key(public_exponent=65537, key_size=2048)


def _token(key, **overrides):
    now = int(time.time())
    payload = {
        "sub": str(uuid.uuid4()),
        "email": "a@b.com",
        "preferred_username": "a",
        "name": "A",
        "email_verified": True,
        "scope": "openid user:read",
        "realm_access": {"roles": ["user"]},
        "iss": settings.keycloak_issuer_url,
        "aud": settings.audience,
        "iat": now,
        "exp": now + 3600,
    }
    payload.update(overrides)
    return jwt.encode(payload, key, algorithm="RS256", headers={"kid": "t"})


def _patch_jwks(pub):
    fake = MagicMock()
    fake.key = pub
    client = MagicMock()
    client.get_signing_key_from_jwt.return_value = fake
    return patch.object(security_mod, "PyJWKClient", return_value=client)


def test_decode_valid(rsa_key):
    pub = rsa_key.public_key()
    token = _token(rsa_key)
    with _patch_jwks(pub):
        data = security_mod._decode_token(token)
    assert data.email == "a@b.com"
    assert "user:read" in data.scopes
    assert "user" in data.roles


def test_decode_expired(rsa_key):
    pub = rsa_key.public_key()
    token = _token(rsa_key, exp=int(time.time()) - 100, iat=int(time.time()) - 200)
    with _patch_jwks(pub):
        with pytest.raises(HTTPException) as ei:
            security_mod._decode_token(token)
    assert ei.value.status_code == 401


def test_decode_wrong_audience(rsa_key):
    pub = rsa_key.public_key()
    token = _token(rsa_key, aud="other")
    with _patch_jwks(pub):
        with pytest.raises(HTTPException):
            security_mod._decode_token(token)


def test_decode_wrong_issuer(rsa_key):
    pub = rsa_key.public_key()
    token = _token(rsa_key, iss="https://evil.example/realms/x")
    with _patch_jwks(pub):
        with pytest.raises(HTTPException):
            security_mod._decode_token(token)


def test_decode_scope_list(rsa_key):
    pub = rsa_key.public_key()
    token = _token(rsa_key, scope=["openid", "profile"])
    with _patch_jwks(pub):
        data = security_mod._decode_token(token)
    assert "openid" in data.scopes
    assert "profile" in data.scopes


def test_decode_permissions_fallback(rsa_key):
    pub = rsa_key.public_key()
    token = _token(rsa_key, scope=None, permissions="admin:write")
    with _patch_jwks(pub):
        data = security_mod._decode_token(token)
    assert "admin:write" in data.scopes


def test_decode_groups_fallback(rsa_key):
    pub = rsa_key.public_key()
    token = _token(rsa_key, realm_access={}, groups=["admin", "ops"])
    with _patch_jwks(pub):
        data = security_mod._decode_token(token)
    assert "admin" in data.roles
    assert "ops" in data.roles


def test_decode_invalid_signature(rsa_key):
    other = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    token = _token(other)  # signed with different key
    with _patch_jwks(rsa_key.public_key()):
        with pytest.raises(HTTPException):
            security_mod._decode_token(token)


def test_bearer_scheme_exists():
    assert security_mod.bearer_scheme is not None
