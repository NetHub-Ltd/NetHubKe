"""JWT validation with explicit test RSA key (no network JWKS)."""
from __future__ import annotations

import time
from unittest.mock import AsyncMock, patch

import jwt
import pytest
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi import HTTPException

from app.core.security import (
    assert_resource_audience,
    client_identities_from_payload,
    decode_access_token_with_key,
    decode_and_authorize_token,
    token_audience_values,
)

ISSUER = "https://idp.test/realms/nethub"
AUDIENCE = "nethub-api"
RESOURCE_AUD = "nethubke-api"
CLIENT_ID = "website-spa"


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
    assert data.email == "user@example.com"


def test_valid_token_multi_audience_list(rsa_keys):
    private_pem, public_pem = rsa_keys
    now = int(time.time())
    token = _mint(
        private_pem,
        {
            "sub": "s1",
            "iss": ISSUER,
            "aud": ["client-a", "client-b"],
            "exp": now + 3600,
        },
    )
    data = decode_access_token_with_key(
        token,
        public_key=public_pem,
        issuer=ISSUER,
        audience=["client-a", "other"],
    )
    assert data.sub == "s1"


def test_expired_token(rsa_keys):
    private_pem, public_pem = rsa_keys
    now = int(time.time())
    token = _mint(
        private_pem,
        {"sub": "s1", "iss": ISSUER, "aud": AUDIENCE, "exp": now - 120},
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
        {"sub": "s1", "iss": "https://evil.example", "aud": AUDIENCE, "exp": now + 3600},
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


# --- Resource audience helpers ---


def test_token_audience_values_string_and_list():
    assert token_audience_values({"aud": "api-1"}) == ["api-1"]
    assert token_audience_values({"aud": ["a", "b"]}) == ["a", "b"]
    assert token_audience_values({}) == []


def test_client_identities_prefer_azp_and_client_id():
    payload = {"aud": RESOURCE_AUD, "azp": CLIENT_ID, "client_id": "other"}
    assert client_identities_from_payload(payload, include_aud=False) == [CLIENT_ID, "other"]
    # legacy includes aud
    ids = client_identities_from_payload(payload, include_aud=True)
    assert CLIENT_ID in ids and RESOURCE_AUD in ids


def test_assert_resource_audience_accepts_intersection():
    assert_resource_audience(
        {"aud": [RESOURCE_AUD, "other"]},
        allowed=[RESOURCE_AUD],
        environment="production",
    )


def test_assert_resource_audience_rejects_wrong_aud():
    with pytest.raises(HTTPException) as exc:
        assert_resource_audience(
            {"aud": "other-api", "azp": CLIENT_ID},
            allowed=[RESOURCE_AUD],
            environment="production",
        )
    assert exc.value.status_code == 401


def test_assert_resource_audience_fail_closed_when_unconfigured_in_production():
    with pytest.raises(HTTPException) as exc:
        assert_resource_audience(
            {"aud": RESOURCE_AUD, "azp": CLIENT_ID},
            allowed=[],
            environment="production",
        )
    assert exc.value.status_code == 401
    assert "not configured" in exc.value.detail


def test_assert_resource_audience_allows_legacy_in_development():
    # empty allowed + development → no raise
    assert_resource_audience(
        {"aud": "anything", "azp": CLIENT_ID},
        allowed=[],
        environment="development",
    )


@pytest.mark.asyncio
async def test_decode_and_authorize_wrong_aud_even_if_client_trusted(rsa_keys, monkeypatch):
    """Wrong resource aud → 401 even when azp is trusted."""
    private_pem, public_pem = rsa_keys
    now = int(time.time())
    token = _mint(
        private_pem,
        {
            "sub": "s1",
            "iss": ISSUER,
            "aud": "other-api",
            "azp": CLIENT_ID,
            "exp": now + 3600,
        },
    )

    class _S:
        oidc_issuer = ISSUER
        resolved_jwks_url = "https://idp.test/jwks"
        jwt_leeway_seconds = 60
        resource_audiences = [RESOURCE_AUD]
        environment = "production"

    monkeypatch.setattr("app.core.security.settings", _S())

    class _Key:
        key = public_pem

    with patch("app.core.security._get_jwks_client") as mock_jwks:
        mock_jwks.return_value.get_signing_key_from_jwt.return_value = _Key()
        with patch(
            "app.core.security.tc_crud.is_client_trusted",
            new_callable=AsyncMock,
            return_value=True,
        ):
            with pytest.raises(HTTPException) as exc:
                await decode_and_authorize_token(AsyncMock(), token)
            assert exc.value.status_code == 401
            # trusted-client must not have been the deciding factor
            # (audience fails first)


@pytest.mark.asyncio
async def test_decode_and_authorize_correct_aud_untrusted_client(rsa_keys, monkeypatch):
    """Correct aud + untrusted client → 401."""
    private_pem, public_pem = rsa_keys
    now = int(time.time())
    token = _mint(
        private_pem,
        {
            "sub": "s1",
            "iss": ISSUER,
            "aud": RESOURCE_AUD,
            "azp": "unknown-client",
            "exp": now + 3600,
        },
    )

    class _S:
        oidc_issuer = ISSUER
        resolved_jwks_url = "https://idp.test/jwks"
        jwt_leeway_seconds = 60
        resource_audiences = [RESOURCE_AUD]
        environment = "production"

    monkeypatch.setattr("app.core.security.settings", _S())

    class _Key:
        key = public_pem

    with patch("app.core.security._get_jwks_client") as mock_jwks:
        mock_jwks.return_value.get_signing_key_from_jwt.return_value = _Key()
        with patch(
            "app.core.security.tc_crud.is_client_trusted",
            new_callable=AsyncMock,
            return_value=False,
        ) as mock_trust:
            with pytest.raises(HTTPException) as exc:
                await decode_and_authorize_token(AsyncMock(), token)
            assert exc.value.status_code == 401
            assert exc.value.detail == "Client is not authorized"
            mock_trust.assert_awaited()


@pytest.mark.asyncio
async def test_decode_and_authorize_correct_aud_and_trusted_client(rsa_keys, monkeypatch):
    """Correct aud + trusted client → TokenData."""
    private_pem, public_pem = rsa_keys
    now = int(time.time())
    token = _mint(
        private_pem,
        {
            "sub": "s1",
            "iss": ISSUER,
            "aud": RESOURCE_AUD,
            "azp": CLIENT_ID,
            "email": "u@example.com",
            "exp": now + 3600,
        },
    )

    class _S:
        oidc_issuer = ISSUER
        resolved_jwks_url = "https://idp.test/jwks"
        jwt_leeway_seconds = 60
        resource_audiences = [RESOURCE_AUD]
        environment = "production"

    monkeypatch.setattr("app.core.security.settings", _S())

    class _Key:
        key = public_pem

    with patch("app.core.security._get_jwks_client") as mock_jwks:
        mock_jwks.return_value.get_signing_key_from_jwt.return_value = _Key()
        with patch(
            "app.core.security.tc_crud.is_client_trusted",
            new_callable=AsyncMock,
            return_value=True,
        ):
            data = await decode_and_authorize_token(AsyncMock(), token)
            assert data.sub == "s1"
            assert data.email == "u@example.com"
            assert data.client_id == CLIENT_ID
