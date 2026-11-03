"""User sync and profile — shared client contract (Architecture A)."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends

from app.api.deps import SessionDep, get_token_data
from app.crud import user as user_crud
from app.db.schemas.schemas import TokenData, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/sync", response_model=UserRead)
async def sync_user(
    session: SessionDep,
    token: Annotated[TokenData, Depends(get_token_data)],
) -> UserRead:
    user = await user_crud.sync_user_from_token(session, token)
    return UserRead.model_validate(user)


@router.get("/me", response_model=UserRead)
async def get_me(
    session: SessionDep,
    token: Annotated[TokenData, Depends(get_token_data)],
) -> UserRead:
    user = await user_crud.resolve_user_from_token(session, token)
    return UserRead.model_validate(user)


@router.patch("/me", response_model=UserRead)
async def patch_me(
    body: UserUpdate,
    session: SessionDep,
    token: Annotated[TokenData, Depends(get_token_data)],
) -> UserRead:
    user = await user_crud.resolve_user_from_token(session, token)
    user = await user_crud.update_user(session, user, body)
    return UserRead.model_validate(user)
