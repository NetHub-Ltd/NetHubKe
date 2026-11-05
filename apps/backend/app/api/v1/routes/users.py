"""User sync and profile — shared client contract (Architecture A)."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Request

from app.api.deps import SessionDep, get_token_data
from app.core.config import settings
from app.core.rate_limit import limiter
from app.crud import user as user_crud
from app.db.schemas.schemas import TokenData, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])

_limit = settings.rate_limit_user_routes


@router.post("/sync", response_model=UserRead)
@limiter.limit(_limit)
async def sync_user(
    request: Request,
    session: SessionDep,
    token: Annotated[TokenData, Depends(get_token_data)],
) -> UserRead:
    user = await user_crud.sync_user_from_token(session, token)
    return UserRead.model_validate(user)


@router.get("/me", response_model=UserRead)
@limiter.limit(_limit)
async def get_me(
    request: Request,
    session: SessionDep,
    token: Annotated[TokenData, Depends(get_token_data)],
) -> UserRead:
    user = await user_crud.resolve_user_from_token(session, token)
    return UserRead.model_validate(user)


@router.patch("/me", response_model=UserRead)
@limiter.limit(_limit)
async def patch_me(
    request: Request,
    body: UserUpdate,
    session: SessionDep,
    token: Annotated[TokenData, Depends(get_token_data)],
) -> UserRead:
    user = await user_crud.resolve_user_from_token(session, token)
    user = await user_crud.update_user(session, user, body)
    return UserRead.model_validate(user)
