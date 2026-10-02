"""JWT validation for the NetHubKe resource server (OIDC IdP-agnostic)."""

from __future__ import annotations

from fastapi import HTTPException
from fastapi.security import HTTPBearer
import jwt
from jwt import PyJWKClient, exceptions

from app.core.config import settings
from app.core.idp_claims import extract_roles
from app.core.scope_claims import merge_scope_claims
from app.db.schemas.schemas import TokenData
from app.utils.logging import logger

bearer_scheme = HTTPBearer(auto_error=False)

# Re-export for callers/tests
__all__ = ["bearer_scheme", "_decode_token", "merge_scope_claims", "extract_roles"]


def _decode_token(token: str) -> TokenData:
    """
    Validate a bearer access token against the configured IdP JWKS.

    Checks: signature (RS256), exp, issuer, audience (from settings).
    Does not load the local user row — callers use deps for that.
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

        if not payload.get("email"):
            logger.warning("Auth Fail | Token missing email claim")
            raise HTTPException(status_code=401, detail="Token missing email claim")

        validate_data = {
            "sub": str(payload.get("sub") or ""),
            "email": payload.get("email"),
            "preferred_username": payload.get("preferred_username"),
            "name": payload.get("name"),
            "email_verified": payload.get("email_verified", False),
            "roles": roles,
            "scope": raw_scope,
        }
        return TokenData(**validate_data)

    except exceptions.ExpiredSignatureError:
        logger.warning("Auth Fail | Token expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except exceptions.InvalidAudienceError:
        logger.error("Auth Fail | Token audience mismatch | expected={}", settings.audience)
        raise HTTPException(status_code=401, detail="Invalid token audience")
    except exceptions.InvalidIssuerError:
        logger.error("Auth Fail | Token issuer mismatch")
        raise HTTPException(status_code=401, detail="Invalid token issuer")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Auth Fail | JWT Error: {}", str(e))
        raise HTTPException(status_code=401, detail="Invalid credentials")
