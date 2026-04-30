from typing import Annotated, Optional
from typing import List

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials
from loguru import logger  # Using your preferred logger
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import bearer_scheme, _decode_token
from app.crud.user import user_crud
from app.db.models.models import User
from app.db.schemas.schemas import TokenData
from app.db.session import get_session

SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def get_token_data(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> TokenData:
    """
    Lean dependency for JIT provisioning.
    Validates JWT but does NOT check the database.
    """
    # 1. Explicit Header Check
    if not credentials or not credentials.credentials:
        logger.warning("Auth Fail | Reason: Missing Authorization Header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        token_data: TokenData = _decode_token(credentials.credentials)
    except Exception as e:
        logger.error(f"Auth Fail | Reason: Malformed or Expired Token | Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    # This only checks the signature and expiry
    return token_data


async def get_current_user(
        db: SessionDep,
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> TokenData:
    """
    Hardened JWT Validation & User Localization.
    Maps Keycloak 'sub' to internal PostgreSQL UUID.
    """
    # 1. Explicit Header Check
    if not credentials or not credentials.credentials:
        logger.warning("Auth Fail | Reason: Missing Authorization Header")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 2. Resilient Token Decoding
    # Note: _decode_token should be wrapped in a try/except inside its own definition
    try:
        token_data: TokenData = _decode_token(credentials.credentials)
    except Exception as e:
        logger.error(f"Auth Fail | Reason: Malformed or Expired Token | Error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    logger.info(f"Auth Attempt | sub: {token_data.sub} | scopes: {token_data.scopes}")

    # 3. Database Integrity Check
    # Ensure token_data.sub exists before querying
    if not token_data.sub:
        raise HTTPException(status_code=401, detail="Token missing subject claim")

    user = await user_crud.get_by_sub(db, token_data.sub)

    if not user:
        logger.warning(f"Auth Fail | sub: {token_data.sub} | Reason: User not in database")
        raise HTTPException(status_code=404, detail="User profile not initialized")

    # 4. Policy Enforcement
    if not user.is_active:
        logger.warning(f"Auth Forbidden | user_id: {user.id} | Reason: Account Disabled")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Please contact NetHub support."
        )

    # 5. Localization & Return
    # Cast user.id to string to ensure Pydantic doesn't complain about UUID vs Str
    logger.info(f"Auth Success | sub: {user.id} | scopes: {token_data.scopes}")

    return token_data.model_copy(update={"sub": str(user.id)})


def require_scopes(required_scopes: List[str], all_required: bool = True):
    def _verifier(user: TokenData = Depends(get_current_user)):
        user_scopes = set(user.scopes)
        req_scopes = set(required_scopes)

        if all_required:
            has_access = req_scopes.issubset(user_scopes)
        else:
            has_access = not req_scopes.isdisjoint(user_scopes)

        if not has_access:
            raise HTTPException(status_code=403, detail="Forbidden")
        return user

    return _verifier