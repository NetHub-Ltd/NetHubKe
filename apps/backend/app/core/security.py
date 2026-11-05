"""IdP-agnostic resource-server JWT validation."""
from __future__ import annotations

from typing import Any

import jwt
from fastapi import HTTPException, status
from jwt import PyJWKClient

from app.core.config import settings
from app.core.logging import get_logger
from app.db.schemas.schemas import TokenData

log = get_logger("auth")

# Module-level client so keys are cached across requests
_jwks_client: PyJWKClient | None = None
_jwks_url_used: str | None = None


def _get_jwks_client(jwks_url: str) -> PyJWKClient:
    global _jwks_client, _jwks_url_used
    if _jwks_client is None or _jwks_url_used != jwks_url:
        _jwks_client = PyJWKClient(jwks_url, cache_keys=True, lifespan=300, timeout=10)
        _jwks_url_used = jwks_url
    return _jwks_client


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
    jwks_url = settings.resolved_jwks_url
    audiences = settings.audiences
    leeway = max(0, int(settings.jwt_leeway_seconds))

    try:
        jwks_client = _get_jwks_client(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        decode_kwargs: dict[str, Any] = {
            "algorithms": ["RS256", "ES256"],
            "issuer": issuer,
            "leeway": leeway,
            "options": {"require": ["exp", "sub"]},
        }
        # PyJWT: single str or list for multiple audiences
        if len(audiences) == 1:
            decode_kwargs["audience"] = audiences[0]
        elif len(audiences) > 1:
            decode_kwargs["audience"] = audiences
        else:
            decode_kwargs["options"] = {
                **decode_kwargs["options"],
                "verify_aud": False,
            }

        payload = jwt.decode(token, signing_key.key, **decode_kwargs)
    except jwt.PyJWTError as exc:
        log.warning(
            "JWT rejected: {} | expected iss={!r} aud={!r} jwks={!r}",
            type(exc).__name__ + (f": {exc}" if str(exc) else ""),
            issuer,
            audiences,
            jwks_url,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except Exception as exc:  # noqa: BLE001
        log.error(
            "JWT validation infrastructure error: {}: {} | jwks={!r}",
            type(exc).__name__,
            exc,
            jwks_url,
        )
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


def decode_access_token_with_key(
    token: str, *, public_key: Any, issuer: str, audience: str | list[str]
) -> TokenData:
    """Test helper: validate with an explicit public key (no JWKS network)."""
    try:
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],
            audience=audience,
            issuer=issuer.rstrip("/"),
            leeway=settings.jwt_leeway_seconds,
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
