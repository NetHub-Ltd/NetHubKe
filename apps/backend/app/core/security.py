from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jwt import PyJWKClient
from jwt.exceptions import (
    ExpiredSignatureError,
    InvalidTokenError,
    InvalidAudienceError,
    InvalidIssuerError,
)

from app.core.config import settings
from app.utils.helpers import utc_now
from app.utils.logging import logger

# logger = logging.getLogger(__name__)

# ------------------------------------------------------------------
# HTTP Bearer (Resource Server Pattern)
# ------------------------------------------------------------------

bearer_scheme = HTTPBearer(auto_error=False)


# ------------------------------------------------------------------
# JWKS Client with TTL Cache + Rotation Safety
# ------------------------------------------------------------------

class JWKSCache:
    def __init__(self) -> None:
        self._jwks_client: Optional[PyJWKClient] = None
        self._last_refresh: Optional[datetime] = None

    def _refresh_needed(self) -> bool:
        if not self._jwks_client or not self._last_refresh:
            return True

        return utc_now() - self._last_refresh > timedelta(
            seconds=settings.jwks_cache_ttl
        )

    def get_client(self) -> PyJWKClient:
        if self._refresh_needed():
            logger.info("Refreshing JWKS client")
            self._jwks_client = PyJWKClient(settings.keycloak_jwks_url)
            self._last_refresh = utc_now()

        return self._jwks_client

    def force_refresh(self) -> PyJWKClient:
        logger.warning("Forcing JWKS refresh due to missing kid")
        self._jwks_client = PyJWKClient(settings.keycloak_jwks_url)
        self._last_refresh = utc_now()
        return self._jwks_client


jwks_cache = JWKSCache()


# ------------------------------------------------------------------
# Token Validation
# ------------------------------------------------------------------

def _decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and validate JWT from Keycloak.
    Handles:
    - Key rotation
    - Expiration
    - Issuer
    - Audience
    - Clock skew
    """

    try:
        jwks_client = jwks_cache.get_client()
        signing_key = jwks_client.get_signing_key_from_jwt(token)

    except Exception:
        # Possibly key rotation → force refresh once
        jwks_client = jwks_cache.force_refresh()
        signing_key = jwks_client.get_signing_key_from_jwt(token)

    payload = jwt.decode(
        token,
        signing_key.key,
        algorithms=settings.algorithms,
        issuer=settings.keycloak_issuer,
        audience=settings.audience,
        options={
            "verify_signature": True,
            "verify_exp": True,
            "verify_nbf": True,
            "verify_iss": True,
            "verify_aud": bool(settings.audience),
        },
        leeway=10,  # clock skew tolerance (seconds)
    )

    return payload


# ------------------------------------------------------------------
# FastAPI Dependency
# ------------------------------------------------------------------

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> Dict[str, Any]:
    """
    Validates JWT and returns structured user data.
    Raises 401 on auth failure.
    """

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = _decode_token(token)

        user = {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "username": payload.get("preferred_username"),
            "realm_roles": payload.get("realm_access", {}).get("roles", []),
            "client_roles": payload.get("resource_access", {}),
            "raw": payload,  # optional: remove if you want stricter boundary
        }

        if not user["sub"]:
            raise InvalidTokenError("Missing sub claim")

        return user

    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except (InvalidAudienceError, InvalidIssuerError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token claims",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except InvalidTokenError as e:
        logger.warning(f"Invalid token: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except Exception:
        logger.exception("Unexpected authentication failure")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication error",
        )




# ------------------------------------------------------------------
# Keycloak Configuration Diagnostics
# ------------------------------------------------------------------

async def get_keycloak_diagnostics() -> Dict[str, Any]:
    """
    Fetches OpenID configuration directly from Keycloak
    and validates backend expectations without rewriting anything.

    This is purely a configuration verification utility.
    """

    # 1️⃣ Fetch OpenID discovery document
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(settings.keycloak_well_known_url)
            resp.raise_for_status()
            openid_config = resp.json()
    except Exception as e:
        logger.error(f"Failed to fetch OpenID configuration: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to reach Keycloak OpenID configuration",
        )

    # 2️⃣ Get JWKS via existing cache client (no manual URL rewriting)
    try:
        jwks_client = jwks_cache.get_client()
        jwks_data = jwks_client.fetch_data()
    except Exception as e:
        logger.error(f"Failed to fetch JWKS: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to fetch JWKS",
        )

    # 3️⃣ Return pure comparison output (no mutation)
    return {
        "backend_expected": {
            "issuer": settings.keycloak_issuer,
            "audience": settings.audience,
            "algorithms": settings.algorithms,
            "jwks_url": settings.keycloak_jwks_url,
            "well_known_url": settings.keycloak_well_known_url,
        },
        "keycloak_discovered": {
            "issuer": openid_config.get("issuer"),
            "authorization_endpoint": openid_config.get("authorization_endpoint"),
            "token_endpoint": openid_config.get("token_endpoint"),
            "jwks_uri": openid_config.get("jwks_uri"),
            "id_token_signing_alg_values_supported": openid_config.get(
                "id_token_signing_alg_values_supported"
            ),
        },
        "jwks_status": {
            "keys_found": len(jwks_data.get("keys", [])),
            "key_ids": [key.get("kid") for key in jwks_data.get("keys", [])],
        },
        "configuration_valid": {
            "issuer_matches": openid_config.get("issuer")
            == settings.keycloak_issuer,
            "jwks_matches_settings": openid_config.get("jwks_uri")
            == settings.keycloak_jwks_url,
        },
    }