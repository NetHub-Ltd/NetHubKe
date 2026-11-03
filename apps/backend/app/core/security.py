"""IdP-agnostic resource-server JWT validation."""
from __future__ import annotations

from typing import Any

import jwt
from fastapi import HTTPException, status
from jwt import PyJWKClient

from app.core.config import settings
from app.db.schemas.schemas import TokenData


def _roles_from_claims(payload: dict[str, Any]) -> list[str]:
    roles: list[str] = []
    realm = payload.get("realm_access") or {}
    if isinstance(realm, dict):
        ra = realm.get("roles") or []
        if isinstance(ra, list):
            roles.extend(str(r) for r in ra)
    direct = payload.get("roles")
    if isinstance(direct, list):
        roles.extend(str(r) for r in direct)
    return list(dict.fromkeys(roles))


def _scopes_from_claims(payload: dict[str, Any]) -> list[str]:
    scope = payload.get("scope") or payload.get("scp") or ""
    if isinstance(scope, list):
        return [str(s) for s in scope]
    if isinstance(scope, str) and scope.strip():
        return scope.split()
    return []


def decode_access_token(token: str) -> TokenData:
    """Validate Bearer access token against configured IdP JWKS."""
    issuer = settings.oidc_issuer.rstrip("/")
    jwks_url = settings.oidc_jwks_url
    if not jwks_url:
        jwks_url = f"{issuer}/protocol/openid-connect/certs"

    try:
        jwks_client = PyJWKClient(jwks_url, cache_keys=True, lifespan=300)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            audience=settings.audience,
            issuer=issuer,
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except Exception as exc:  # noqa: BLE001 — JWKS fetch failures etc.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to validate token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    sub = payload.get("sub")
    if sub is None or str(sub).strip() == "":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenData(
        sub=str(sub),
        email=payload.get("email"),
        name=payload.get("name"),
        preferred_username=payload.get("preferred_username"),
        roles=_roles_from_claims(payload),
        scopes=_scopes_from_claims(payload),
        issuer=str(payload.get("iss") or issuer),
    )


def decode_access_token_with_key(token: str, *, public_key: Any, issuer: str, audience: str) -> TokenData:
    """Test helper: validate with an explicit public key (no JWKS network)."""
    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=audience,
            issuer=issuer.rstrip("/"),
            options={"require": ["exp", "sub"]},
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    sub = payload.get("sub")
    if sub is None or str(sub).strip() == "":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return TokenData(
        sub=str(sub),
        email=payload.get("email"),
        name=payload.get("name"),
        preferred_username=payload.get("preferred_username"),
        roles=_roles_from_claims(payload),
        scopes=_scopes_from_claims(payload),
        issuer=str(payload.get("iss") or issuer),
    )
