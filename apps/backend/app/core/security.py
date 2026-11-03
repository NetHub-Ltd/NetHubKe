"""OIDC access-token validation using provider discovery metadata."""

from __future__ import annotations

from functools import lru_cache
from threading import Lock
from time import monotonic
from typing import Any
from urllib.parse import urlsplit

import httpx
import jwt
from fastapi import HTTPException
from fastapi.security import HTTPBearer
from jwt import PyJWKClient, exceptions

from app.core.config import settings
from app.core.idp_claims import extract_roles
from app.core.scope_claims import merge_scope_claims
from app.db.schemas.schemas import TokenData
from app.utils.logging import logger

bearer_scheme = HTTPBearer(auto_error=False)

__all__ = ["bearer_scheme", "_decode_token", "merge_scope_claims", "extract_roles"]

_DISCOVERY_TTL_SECONDS = 300
_discovery_cache: dict[str, tuple[float, dict[str, Any]]] = {}
_discovery_lock = Lock()


def _validate_endpoint(url: str, *, label: str) -> str:
    """Reject malformed endpoints and plaintext transport in production."""
    parsed = urlsplit(url)
    if parsed.scheme not in {"https", "http"} or not parsed.netloc:
        raise ValueError(f"OIDC discovery contains an invalid {label}")
    environment = getattr(settings.environment, "value", settings.environment)
    if environment == "production" and parsed.scheme != "https":
        raise ValueError(f"OIDC discovery contains a non-HTTPS {label}")
    return url


def _get_oidc_discovery(issuer: str) -> dict[str, Any]:
    """Fetch standard OIDC metadata with a short bounded process-local cache."""
    normalized_issuer = issuer
    now = monotonic()
    with _discovery_lock:
        cached = _discovery_cache.get(normalized_issuer)
        if cached and now - cached[0] < _DISCOVERY_TTL_SECONDS:
            return cached[1]

    _validate_endpoint(normalized_issuer, label="issuer")
    discovery_base = normalized_issuer[:-1] if normalized_issuer.endswith(chr(47)) else normalized_issuer
    discovery_url = f"{discovery_base}/.well-known/openid-configuration"
    try:
        with httpx.Client(timeout=5.0, follow_redirects=False) as client:
            response = client.get(
                discovery_url,
                headers={"Accept": "application/json", "User-Agent": "NetHubKe-OIDC"},
            )
            response.raise_for_status()
            metadata = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        logger.error("OIDC discovery failed for configured issuer: {}", normalized_issuer)
        raise HTTPException(status_code=503, detail="Identity provider discovery unavailable") from exc

    if not isinstance(metadata, dict):
        raise HTTPException(status_code=503, detail="Identity provider discovery document is invalid")

    discovered_issuer = metadata.get("issuer")
    if not isinstance(discovered_issuer, str) or discovered_issuer != normalized_issuer:
        raise HTTPException(status_code=503, detail="Identity provider discovery issuer mismatch")

    jwks_uri = metadata.get("jwks_uri")
    if not isinstance(jwks_uri, str) or not jwks_uri:
        raise HTTPException(status_code=503, detail="Identity provider discovery has no jwks_uri")

    try:
        _validate_endpoint(jwks_uri, label="jwks_uri")
        for key in ("authorization_endpoint", "token_endpoint", "userinfo_endpoint", "end_session_endpoint"):
            endpoint = metadata.get(key)
            if endpoint is not None:
                if not isinstance(endpoint, str) or not endpoint:
                    raise ValueError(f"OIDC discovery contains an invalid {key}")
                _validate_endpoint(endpoint, label=key)
    except ValueError as exc:
        raise HTTPException(status_code=503, detail="Identity provider discovery contains an unsafe endpoint") from exc

    with _discovery_lock:
        _discovery_cache[normalized_issuer] = (monotonic(), metadata)
    return metadata


@lru_cache(maxsize=4)
def _get_jwks_client(jwks_url: str, lifespan: int) -> PyJWKClient:
    """Reuse a bounded JWKS client; PyJWT refreshes the key set after lifespan."""
    return PyJWKClient(
        uri=jwks_url,
        cache_jwk_set=True,
        lifespan=lifespan,
        cache_keys=False,
        timeout=5,
        headers={"User-Agent": "NetHubKe-Resource-Server", "Accept": "application/json"},
    )


def _fetch_userinfo(access_token: str, userinfo_endpoint: str) -> dict[str, Any]:
    """Fetch standard OIDC UserInfo when the access token omits profile claims."""
    try:
        with httpx.Client(timeout=5.0, follow_redirects=False) as client:
            response = client.get(
                userinfo_endpoint,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )
    except httpx.HTTPError as exc:
        logger.error("OIDC UserInfo request failed: {}", str(exc))
        raise HTTPException(status_code=401, detail="Unable to load identity profile") from exc

    if response.status_code != 200:
        logger.warning("OIDC UserInfo rejected with status={}", response.status_code)
        raise HTTPException(status_code=401, detail="Identity provider rejected UserInfo request")

    data = response.json()
    if not isinstance(data, dict):
        raise HTTPException(status_code=401, detail="Identity provider returned invalid UserInfo")
    return data


def _decode_token(token: str) -> TokenData:
    """Validate signature, issuer, audience and required claims using OIDC metadata."""
    try:
        issuer = settings.idp_issuer
        metadata = _get_oidc_discovery(issuer)
        jwks_uri = str(metadata["jwks_uri"])
        jwks_lifespan = max(1, min(300, int(settings.jwks_cache_ttl)))
        jwks_client = _get_jwks_client(jwks_uri, jwks_lifespan)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=settings.algorithms,
            audience=settings.audience,
            issuer=issuer,
            options={"require": ["exp", "iat", "sub"]},
            leeway=10,
        )

        raw_scope = merge_scope_claims(payload)
        roles = extract_roles(payload, settings.oidc_role_claim_path)

        email = payload.get("email")
        name = payload.get("name")
        preferred = payload.get("preferred_username")
        email_verified = payload.get("email_verified", False)

        if not email:
            userinfo_endpoint = metadata.get("userinfo_endpoint")
            if not isinstance(userinfo_endpoint, str) or not userinfo_endpoint:
                raise HTTPException(status_code=401, detail="Token has no email and provider has no UserInfo endpoint")
            info = _fetch_userinfo(token, userinfo_endpoint)
            userinfo_sub = info.get("sub")
            if userinfo_sub is not None and userinfo_sub != payload.get("sub"):
                raise HTTPException(status_code=401, detail="UserInfo subject does not match access token")
            email = info.get("email")
            name = info.get("name") or name
            preferred = info.get("preferred_username") or preferred
            if "email_verified" in info:
                email_verified = bool(info.get("email_verified"))
            roles = extract_roles({**payload, **info}, settings.oidc_role_claim_path) or roles

        if not email:
            raise HTTPException(status_code=401, detail="Identity token is missing required email claim")

        return TokenData(
            sub=str(payload.get("sub") or ""),
            iss=str(payload.get("iss") or issuer),
            email=email,
            preferred_username=preferred,
            name=name,
            email_verified=email_verified,
            roles=roles,
            scope=raw_scope,
        )

    except exceptions.ExpiredSignatureError:
        logger.warning("Authentication failed: upstream token expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except exceptions.InvalidAudienceError:
        logger.warning("Authentication failed: upstream token audience mismatch")
        raise HTTPException(status_code=401, detail="Invalid token audience")
    except exceptions.InvalidIssuerError:
        logger.warning("Authentication failed: upstream token issuer mismatch")
        raise HTTPException(status_code=401, detail="Invalid token issuer")
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Authentication failed while validating upstream JWT: {}", str(exc))
        raise HTTPException(status_code=401, detail="Invalid credentials")
