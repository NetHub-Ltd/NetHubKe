"""IdP-agnostic resource-server JWT validation + trusted client check."""
from __future__ import annotations

from typing import Any

import jwt
from fastapi import HTTPException, status
from jwt import PyJWKClient
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings
from app.core.logging import get_logger
from app.crud import trusted_clients as tc_crud
from app.db.schemas.schemas import TokenData

log = get_logger("auth")

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


def _client_ids_from_payload(payload: dict[str, Any]) -> list[str]:
    ids: list[str] = []
    aud = payload.get("aud")
    if isinstance(aud, str) and aud:
        ids.append(aud)
    elif isinstance(aud, list):
        ids.extend(str(a) for a in aud if a)
    for key in ("client_id", "azp"):
        val = payload.get(key)
        if isinstance(val, str) and val:
            ids.append(val)
    # preserve order, unique
    return list(dict.fromkeys(ids))


def decode_access_token_unverified_claims(token: str) -> dict[str, Any]:
    """Signature+issuer validated path uses full decode; helper for tests."""
    return jwt.decode(token, options={"verify_signature": False})


async def decode_and_authorize_token(session: AsyncSession, token: str) -> TokenData:
    """Validate JWT cryptographically, then require a trusted client_id/aud."""
    issuer = settings.oidc_issuer.rstrip("/")
    jwks_url = settings.resolved_jwks_url
    leeway = max(0, int(settings.jwt_leeway_seconds))

    try:
        jwks_client = _get_jwks_client(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256", "ES256"],
            issuer=issuer,
            leeway=leeway,
            options={"require": ["exp", "sub"], "verify_aud": False},
        )
    except jwt.PyJWTError as exc:
        log.warning(
            "JWT rejected: {} | expected iss={!r} jwks={!r}",
            type(exc).__name__ + (f": {exc}" if str(exc) else ""),
            issuer,
            jwks_url,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    except Exception as exc:  # noqa: BLE001
        log.error("JWT validation infrastructure error: {}: {}", type(exc).__name__, exc)
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

    client_ids = _client_ids_from_payload(payload)
    if not await tc_crud.is_client_trusted(session, client_ids):
        log.warning("JWT client not trusted client_ids={!r}", client_ids)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Client is not authorized",
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
        client_id=client_ids[0] if client_ids else None,
    )


def decode_access_token_with_key(
    token: str, *, public_key: Any, issuer: str, audience: str | list[str] | None = None
) -> TokenData:
    """Test helper: crypto validation only (trusted-client check done separately in API tests)."""
    try:
        kwargs: dict[str, Any] = {
            "algorithms": ["RS256"],
            "issuer": issuer.rstrip("/"),
            "leeway": settings.jwt_leeway_seconds,
            "options": {"require": ["exp", "sub"], "verify_aud": audience is not None},
        }
        if audience is not None:
            kwargs["audience"] = audience
        payload = jwt.decode(token, public_key, **kwargs)
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
    client_ids = _client_ids_from_payload(payload)
    return TokenData(
        sub=str(sub),
        email=payload.get("email"),
        name=payload.get("name"),
        preferred_username=payload.get("preferred_username"),
        roles=_roles_from_claims(payload),
        scopes=_scopes_from_claims(payload),
        issuer=str(payload.get("iss") or issuer),
        client_id=client_ids[0] if client_ids else None,
    )


# Back-compat name used by older tests / deps during transition
def decode_access_token(token: str) -> TokenData:
    """Deprecated sync path — raises; use decode_and_authorize_token."""
    raise RuntimeError("Use decode_and_authorize_token(session, token) with DB session")
