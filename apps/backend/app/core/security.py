from fastapi.security import HTTPBearer

from app.core.config import settings
from app.db.schemas.schemas import TokenData
from app.utils.logging import logger

# ------------------------------------------------------------------
# HTTP Bearer (Resource Server Pattern)
# ------------------------------------------------------------------

bearer_scheme = HTTPBearer(auto_error=False)


# ------------------------------------------------------------------
# Token Validation
# ------------------------------------------------------------------
import jwt  # This is PyJWT
from jwt import PyJWKClient, exceptions
from fastapi import HTTPException


def _decode_token(token: str) -> TokenData:
    try:
        # 1. PyJWT's native JWKS client (cleaner than custom wrappers)
        # Customizing the cache behavior
        logger.debug(f"Keycloak Issuer | {settings.keycloak_issuer_url}")
        jwks_client = PyJWKClient(
            uri=settings.keycloak_jwks,
            cache_jwk_set=True,
            lifespan=600,
            cache_keys=True,
            max_cached_keys=16,
            # Add this block below
            headers={
                "User-Agent": "FastAPI-Resource-Server",
                "Accept": "application/json"
            }
        )
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # 2. Decode & Validate
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=settings.algorithms,
            audience="nethub-backend",
            issuer=settings.keycloak_issuer_url,
            leeway=10
        )

        # 3. Flat Dictionary for your Pydantic Schema
        # 3. Flat Dictionary for your Pydantic Schema
        validate_data = {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "preferred_username": payload.get("preferred_username"),
            "name": payload.get("name"),
            "email_verified": payload.get("email_verified", False),
            # If your Pydantic model requires 'roles', map Authentik groups to it
            "roles": payload.get("groups", []),
            "groups": payload.get("groups", []),
            "scope": payload.get("permissions", ""),
        }
        data = TokenData(**validate_data)
        return data

    except exceptions.ExpiredSignatureError:
        logger.warning("Auth Fail | Token expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except exceptions.InvalidAudienceError:
        logger.error("Auth Fail | Token audience mismatch")
        raise HTTPException(status_code=401, detail="Invalid token audience")
    except Exception as e:
        logger.error("Auth Fail | JWT Error: {}", str(e))
        raise HTTPException(status_code=401, detail="Invalid credentials")


