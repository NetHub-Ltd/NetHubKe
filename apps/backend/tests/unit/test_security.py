"""OIDC JWT validation tests using local RSA keys and mocked discovery metadata."""

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


@pytest.fixture(autouse=True)
def mock_oidc_discovery(monkeypatch, request):
    if request.node.name.startswith("test_discovery_"):
        yield
        return

    metadata = {
        "issuer": settings.idp_issuer,
        "jwks_uri": "https://provider.example/keys/public",
        "userinfo_endpoint": "https://provider.example/identity/profile",
    }
    monkeypatch.setattr(security_mod, "_get_oidc_discovery", lambda _issuer: metadata)
    monkeypatch.setattr(settings, "oidc_role_claim_path", "roles")
    security_mod._get_jwks_client.cache_clear()
    yield
    security_mod._get_jwks_client.cache_clear()


def _token(key, **overrides):
    now = int(time.time())
    payload = {
        "sub": str(uuid.uuid4()),
        "email": "user@example.com",
        "preferred_username": "a",
        "name": "A",
        "email_verified": True,
        "scope": "openid user:read",
        "roles": ["user"],
        "iss": settings.idp_issuer,
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
    token = _token(rsa_key)
    with _patch_jwks(rsa_key.public_key()):
        data = security_mod._decode_token(token)
    assert data.email == "user@example.com"
    assert "user:read" in data.scopes
    assert "user" in data.roles


def test_decode_expired(rsa_key):
    token = _token(rsa_key, exp=int(time.time()) - 100, iat=int(time.time()) - 200)
    with _patch_jwks(rsa_key.public_key()):
        with pytest.raises(HTTPException) as error:
            security_mod._decode_token(token)
    assert error.value.status_code == 401


def test_decode_wrong_audience(rsa_key):
    token = _token(rsa_key, aud="other")
    with _patch_jwks(rsa_key.public_key()):
        with pytest.raises(HTTPException):
            security_mod._decode_token(token)


def test_decode_wrong_issuer(rsa_key):
    token = _token(rsa_key, iss="https://untrusted.example/issuer")
    with _patch_jwks(rsa_key.public_key()):
        with pytest.raises(HTTPException):
            security_mod._decode_token(token)


def test_decode_scope_list(rsa_key):
    token = _token(rsa_key, scope=["openid", "profile", "user:read"])
    with _patch_jwks(rsa_key.public_key()):
        data = security_mod._decode_token(token)
    assert "user:read" in data.scopes
    assert "profile" not in data.scopes
    assert "openid" not in data.scopes


def test_decode_permissions_fallback(rsa_key):
    token = _token(rsa_key, scope=None, permissions="admin:write")
    with _patch_jwks(rsa_key.public_key()):
        data = security_mod._decode_token(token)
    assert "admin:write" in data.scopes


def test_decode_standard_groups_fallback(rsa_key):
    token = _token(rsa_key, roles=[], groups=["admin", "ops"])
    with _patch_jwks(rsa_key.public_key()):
        data = security_mod._decode_token(token)
    assert "admin" in data.roles
    assert "ops" in data.roles


def test_decode_custom_configured_role_claim(rsa_key, monkeypatch):
    monkeypatch.setattr(settings, "oidc_role_claim_path", "urn:example:roles")
    token = _token(
        rsa_key,
        roles=None,
        **{"urn:example:roles": {"admin": {"enabled": True}, "support": {}}},
    )
    with _patch_jwks(rsa_key.public_key()):
        data = security_mod._decode_token(token)
    assert data.roles == ["admin", "support"]


def test_decode_invalid_signature(rsa_key):
    other = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    token = _token(other)
    with _patch_jwks(rsa_key.public_key()):
        with pytest.raises(HTTPException):
            security_mod._decode_token(token)


def test_bearer_scheme_exists():
    assert security_mod.bearer_scheme is not None


@pytest.mark.parametrize(
    ("issuer", "jwks_uri", "userinfo_endpoint"),
    [
        ("https://identity-a.example", "https://identity-a.example/keys", "https://identity-a.example/me"),
        ("https://identity-b.example/tenant", "https://keys.identity-b.example/jwks", "https://identity-b.example/profile"),
    ],
)
def test_discovery_uses_each_provider_advertised_endpoints(
    issuer, jwks_uri, userinfo_endpoint, monkeypatch
):
    security_mod._discovery_cache.clear()
    client = MagicMock()
    client.__enter__.return_value = client
    response = MagicMock()
    response.json.return_value = {
        "issuer": issuer,
        "jwks_uri": jwks_uri,
        "userinfo_endpoint": userinfo_endpoint,
        "authorization_endpoint": issuer + "/authorize/custom",
        "token_endpoint": issuer + "/token/custom",
        "end_session_endpoint": issuer + "/logout/custom",
    }
    response.raise_for_status.return_value = None
    client.get.return_value = response
    monkeypatch.setattr(security_mod.httpx, "Client", lambda **_kwargs: client)

    metadata = security_mod._get_oidc_discovery(issuer)

    assert metadata["jwks_uri"] == jwks_uri
    assert metadata["userinfo_endpoint"] == userinfo_endpoint
    assert client.get.call_args.args[0] == issuer + "/.well-known/openid-configuration"


def test_discovery_rejects_mismatched_issuer(monkeypatch):
    security_mod._discovery_cache.clear()
    client = MagicMock()
    client.__enter__.return_value = client
    response = MagicMock()
    response.json.return_value = {
        "issuer": "https://attacker.example",
        "jwks_uri": "https://attacker.example/keys",
    }
    response.raise_for_status.return_value = None
    client.get.return_value = response
    monkeypatch.setattr(security_mod.httpx, "Client", lambda **_kwargs: client)

    with pytest.raises(HTTPException) as error:
        security_mod._get_oidc_discovery("https://trusted.example")
    assert error.value.status_code == 503


@pytest.mark.parametrize("missing_claim", ["exp", "iat", "sub"])
def test_decode_rejects_missing_required_claim(rsa_key, missing_claim):
    payload = {
        "sub": str(uuid.uuid4()),
        "email": "user@example.com",
        "roles": ["user"],
        "iss": settings.idp_issuer,
        "aud": settings.audience,
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600,
    }
    payload.pop(missing_claim)
    token = jwt.encode(payload, rsa_key, algorithm="RS256", headers={"kid": "t"})
    with _patch_jwks(rsa_key.public_key()):
        with pytest.raises(HTTPException) as error:
            security_mod._decode_token(token)
    assert error.value.status_code == 401


def test_decode_rejects_wrong_signature_algorithm(rsa_key):
    token = jwt.encode(
        {
            "sub": "subject",
            "iss": settings.idp_issuer,
            "aud": settings.audience,
            "iat": int(time.time()),
            "exp": int(time.time()) + 60,
        },
        "attacker-controlled-secret",
        algorithm="HS256",
        headers={"kid": "t"},
    )
    with _patch_jwks(rsa_key.public_key()):
        with pytest.raises(HTTPException) as error:
            security_mod._decode_token(token)
    assert error.value.status_code == 401


def test_jwks_client_is_reused_and_refresh_lifetime_is_bounded():
    with patch.object(security_mod, "PyJWKClient") as constructor:
        first = security_mod._get_jwks_client("https://issuer.example/jwks", 300)
        second = security_mod._get_jwks_client("https://issuer.example/jwks", 300)
    assert first is second
    constructor.assert_called_once()
    assert constructor.call_args.kwargs["lifespan"] == 300
    assert constructor.call_args.kwargs["cache_keys"] is False
    assert constructor.call_args.kwargs["timeout"] == 5


def test_decode_uses_discovered_userinfo_endpoint_when_profile_claims_are_missing(
    rsa_key, monkeypatch
):
    subject = str(uuid.uuid4())
    token = _token(rsa_key, sub=subject, email=None, name=None)
    userinfo = {"sub": subject, "email": "resolved@example.com", "name": "Resolved User"}
    fetch = MagicMock(return_value=userinfo)
    monkeypatch.setattr(security_mod, "_fetch_userinfo", fetch)

    with _patch_jwks(rsa_key.public_key()):
        data = security_mod._decode_token(token)

    assert data.email == "resolved@example.com"
    fetch.assert_called_once_with(token, "https://provider.example/identity/profile")


def test_decode_rejects_userinfo_subject_mismatch(rsa_key, monkeypatch):
    token = _token(rsa_key, email=None)
    monkeypatch.setattr(
        security_mod,
        "_fetch_userinfo",
        MagicMock(return_value={"sub": "different-subject", "email": "resolved@example.com"}),
    )

    with _patch_jwks(rsa_key.public_key()):
        with pytest.raises(HTTPException) as error:
            security_mod._decode_token(token)
    assert error.value.status_code == 401


def test_discovery_rejects_plaintext_endpoints_in_production(monkeypatch):
    from app.core.config import EnvironmentEnum

    security_mod._discovery_cache.clear()
    monkeypatch.setattr(settings, "environment", EnvironmentEnum.PRODUCTION)
    client = MagicMock()
    client.__enter__.return_value = client
    response = MagicMock()
    response.json.return_value = {
        "issuer": "https://trusted.example",
        "jwks_uri": "http://trusted.example/keys",
    }
    response.raise_for_status.return_value = None
    client.get.return_value = response
    monkeypatch.setattr(security_mod.httpx, "Client", lambda **_kwargs: client)

    with pytest.raises(HTTPException) as error:
        security_mod._get_oidc_discovery("https://trusted.example")
    assert error.value.status_code == 503


@pytest.mark.parametrize("userinfo_sub", [None, "different-subject"])
def test_decode_userinfo_requires_exact_subject_match(rsa_key, monkeypatch, userinfo_sub):
    """UserInfo claims must be bound to the already validated access-token subject."""
    token = _token(rsa_key, email=None)
    userinfo = {
        "email": "userinfo@example.com",
        "email_verified": True,
        "name": "UserInfo User",
    }
    if userinfo_sub is not None:
        userinfo["sub"] = userinfo_sub
    monkeypatch.setattr(
        security_mod,
        "_fetch_userinfo",
        lambda _token, _endpoint: userinfo,
    )

    with _patch_jwks(rsa_key.public_key()):
        with pytest.raises(HTTPException) as error:
            security_mod._decode_token(token)

    assert error.value.status_code == 401
    assert error.value.detail == "UserInfo subject does not match access token"


def test_decode_userinfo_accepts_matching_subject(rsa_key, monkeypatch):
    """A matching UserInfo subject may enrich profile claims omitted by the access token."""
    subject = str(uuid.uuid4())
    token = _token(rsa_key, sub=subject, email=None)
    monkeypatch.setattr(
        security_mod,
        "_fetch_userinfo",
        lambda _token, _endpoint: {
            "sub": subject,
            "email": "userinfo@example.com",
            "email_verified": True,
            "name": "UserInfo User",
        },
    )

    with _patch_jwks(rsa_key.public_key()):
        data = security_mod._decode_token(token)

    assert data.sub == subject
    assert data.email == "userinfo@example.com"
