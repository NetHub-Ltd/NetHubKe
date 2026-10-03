"""JWT validation for the NetHubKe resource server (OIDC IdP-agnostic)."""

from __future__ import annotations

from typing import Any

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


def _userinfo_url(issuer: str) -> str:
    base = issuer.rstrip("/")
    # Zitadel / many OIDC providers
    return f"{base}/oidc/v1/userinfo"


def _fetch_userinfo(access_token: str, issuer: str) -> dict[str, Any]:
    """
    OIDC UserInfo — used when the access token is a JWT without profile claims
    (Zitadel puts email/name on the ID token / userinfo, not on the access token).
    """
    url = _userinfo_url(issuer)
    try:
        with httpx.Client(timeout=5.0) as client:
            resp = client.get(
                url,
                headers={
                    "Authorization": f"Bearer {access_token}",
                    "Accept": "application/json",
                },
            )
    except httpx.HTTPError as e:
        logger.error("UserInfo request failed | {}", str(e))
        raise HTTPException(
            status_code=401,
            detail="Unable to load user profile from identity provider",
        ) from e

    if resp.status_code != 200:
        logger.warning(
            "UserInfo rejected | status={} body={}",
            resp.status_code,
            resp.text[:200],
        )
        raise HTTPException(
            status_code=401,
            detail="Token missing email claim and UserInfo unavailable",
        )

    data = resp.json()
    if not isinstance(data, dict):
        raise HTTPException(status_code=401, detail="Invalid UserInfo response")
    return data


def _decode_token(token: str) -> TokenData:
    """
    Validate a bearer access token against the configured IdP JWKS.

    Checks: signature (RS256), exp, issuer, audience (from settings).
    If the JWT has no email (typical for Zitadel access tokens), fetch
    profile claims from the OIDC UserInfo endpoint with the same token.
    """
    try:
        issuer = settings.idp_issuer
        jwks_url = settings.idp_jwks_url
        logger.debug("OIDC Issuer | {} | JWKS | {}", issuer, jwks_url)
        jwks_client = PyJWKClient(
            uri=jwks_url,
            cache_jwk_set=True,
            lifespan=min(600, settings.jwks_cache_ttl),
            cache_keys=True,
            max_cached_keys=16,
            headers={
                "User-Agent": "FastAPI-Resource-Server",
                "Accept": "application/json",
            },
        )
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=settings.algorithms,
            audience=settings.audience,
            issuer=issuer,
            leeway=10,
        )

        raw_scope = merge_scope_claims(payload)
        roles = extract_roles(payload)

        email = payload.get("email")
        name = payload.get("name")
        preferred = payload.get("preferred_username")
        email_verified = payload.get("email_verified", False)

        # Zitadel (and some IdPs): profile claims live on ID token / UserInfo only
        if not email:
            logger.info("Access token has no email; fetching OIDC UserInfo")
            info = _fetch_userinfo(token, issuer)
            email = info.get("email") or email
            name = info.get("name") or name
            preferred = (
                info.get("preferred_username")
                or info.get("username")
                or preferred
            )
            if "email_verified" in info:
                email_verified = bool(info.get("email_verified"))
            # Merge any roles from userinfo if present
            roles = extract_roles({**payload, **info}) or roles

        if not email:
            logger.warning("Auth Fail | Token and UserInfo missing email claim")
            raise HTTPException(status_code=401, detail="Token missing email claim")

        validate_data = {
            "sub": str(payload.get("sub") or ""),
            "email": email,
            "preferred_username": preferred,
            "name": name,
            "email_verified": email_verified,
            "roles": roles,
            "scope": raw_scope,
        }
        return TokenData(**validate_data)

    except exceptions.ExpiredSignatureError:
        logger.warning("Auth Fail | Token expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except exceptions.InvalidAudienceError:
        logger.error(
            "Auth Fail | Token audience mismatch | expected={}", settings.audience
        )
        raise HTTPException(status_code=401, detail="Invalid token audience")
    except exceptions.InvalidIssuerError:
        logger.error("Auth Fail | Token issuer mismatch")
        raise HTTPException(status_code=401, detail="Invalid token issuer")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Auth Fail | JWT Error: {}", str(e))
        raise HTTPException(status_code=401, detail="Invalid credentials")
