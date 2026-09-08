"""JWT validation for the NetHubKe resource server (Keycloak as IdP only)."""

from fastapi import HTTPException
from fastapi.security import HTTPBearer
import jwt
from jwt import PyJWKClient, exceptions

from app.core.config import settings
from app.db.schemas.schemas import TokenData
from app.utils.logging import logger

bearer_scheme = HTTPBearer(auto_error=False)


def _decode_token(token: str) -> TokenData:
    """
    Validate a bearer access token against Keycloak JWKS.

    Checks: signature (RS256), exp, issuer, audience (from settings).
    Does not load the local user row — callers use deps for that.
    """
    try:
        logger.debug("Keycloak Issuer | {}", settings.keycloak_issuer_url)
        jwks_client = PyJWKClient(
            uri=settings.keycloak_jwks,
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
            issuer=settings.keycloak_issuer_url,
            leeway=10,
        )

        # Keycloak: space-separated scopes in "scope"; some setups use "permissions"
        raw_scope = payload.get("scope") or payload.get("permissions") or ""
        if isinstance(raw_scope, list):
            raw_scope = " ".join(raw_scope)

        # Roles: prefer realm roles; fall back to groups
        realm_access = payload.get("realm_access") or {}
        roles = list(realm_access.get("roles") or payload.get("groups") or [])

        validate_data = {
            "sub": payload.get("sub"),
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
