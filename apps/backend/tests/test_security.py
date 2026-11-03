"""A3: JWT validation with explicit test RSA key (no network JWKS)."""
from __future__ import annotations

import time

import jwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException

from app.core.security import decode_access_token_with_key

ISSUER = "https://idp.test/realms/nethub"
AUDIENCE = "nethub-api"


@pytest.fixture(scope="module")
def rsa_keys():
    key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    private_pem = key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    public_pem = key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    )
    return private_pem, public_pem


def _mint(private_pem: bytes, claims: dict) -> str:
    return jwt.encode(claims, private_pem, algorithm="RS256")


def test_valid_token(rsa_keys):
    private_pem, public_pem = rsa_keys
    now = int(time.time())
    token = _mint(
        private_pem,
        {
            "sub": "12345678901234567890",
            "iss": ISSUER,
            "aud": AUDIENCE,
            "exp": now + 3600,
            "email": "user@example.com",
            "name": "Test User",
        },
    )
    data = decode_access_token_with_key(
        token, public_key=public_pem, issuer=ISSUER, audience=AUDIENCE
    )
    assert data.sub == "12345678901234567890"
    assert isinstance(data.sub, str)
    assert data.email == "user@example.com"
    assert data.issuer == ISSUER


def test_expired_token(rsa_keys):
    private_pem, public_pem = rsa_keys
    now = int(time.time())
    token = _mint(
        private_pem,
        {"sub": "s1", "iss": ISSUER, "aud": AUDIENCE, "exp": now - 10},
    )
    with pytest.raises(HTTPException) as exc:
        decode_access_token_with_key(
            token, public_key=public_pem, issuer=ISSUER, audience=AUDIENCE
        )
    assert exc.value.status_code == 401


def test_wrong_audience(rsa_keys):
    private_pem, public_pem = rsa_keys
    now = int(time.time())
    token = _mint(
        private_pem,
        {"sub": "s1", "iss": ISSUER, "aud": "other-api", "exp": now + 3600},
    )
    with pytest.raises(HTTPException) as exc:
        decode_access_token_with_key(
            token, public_key=public_pem, issuer=ISSUER, audience=AUDIENCE
        )
    assert exc.value.status_code == 401


def test_wrong_issuer(rsa_keys):
    private_pem, public_pem = rsa_keys
    now = int(time.time())
    token = _mint(
        private_pem,
        {
            "sub": "s1",
            "iss": "https://evil.example",
            "aud": AUDIENCE,
            "exp": now + 3600,
        },
    )
    with pytest.raises(HTTPException) as exc:
        decode_access_token_with_key(
            token, public_key=public_pem, issuer=ISSUER, audience=AUDIENCE
        )
    assert exc.value.status_code == 401


def test_bad_signature(rsa_keys):
    _, public_pem = rsa_keys
    other = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    other_pem = other.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    )
    now = int(time.time())
    token = _mint(
        other_pem,
        {"sub": "s1", "iss": ISSUER, "aud": AUDIENCE, "exp": now + 3600},
    )
    with pytest.raises(HTTPException) as exc:
        decode_access_token_with_key(
            token, public_key=public_pem, issuer=ISSUER, audience=AUDIENCE
        )
    assert exc.value.status_code == 401


def test_missing_sub(rsa_keys):
    private_pem, public_pem = rsa_keys
    now = int(time.time())
    token = _mint(
        private_pem,
        {"iss": ISSUER, "aud": AUDIENCE, "exp": now + 3600},
    )
    with pytest.raises(HTTPException) as exc:
        decode_access_token_with_key(
            token, public_key=public_pem, issuer=ISSUER, audience=AUDIENCE
        )
    assert exc.value.status_code == 401
