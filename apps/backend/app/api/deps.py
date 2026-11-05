"""FastAPI dependencies."""
from __future__ import annotations

from typing import Annotated, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.security import decode_and_authorize_token
from app.crud import user as user_crud
from app.db.models.models import User
from app.db.schemas.schemas import TokenData
from app.db.session import get_session

bearer_scheme = HTTPBearer(auto_error=False)
SessionDep = Annotated[AsyncSession, Depends(get_session)]


async def get_token_data(
    session: SessionDep,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> TokenData:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return await decode_and_authorize_token(session, credentials.credentials)


async def get_current_user(
    session: SessionDep,
    token: Annotated[TokenData, Depends(get_token_data)],
) -> User:
    return await user_crud.resolve_user_from_token(session, token)


async def get_current_admin(
    user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin required")
    return user
