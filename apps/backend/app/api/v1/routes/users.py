from fastapi import APIRouter, Depends, HTTPException
from loguru import logger

from app.api.deps import require_scopes, SessionDep, get_token_data
from app.crud.user import user_crud
from app.db.schemas.schemas import TokenData
from app.db.schemas.schemas import UserRead, UserUpdate
from app.utils.helpers import utc_now

router = APIRouter()


@router.post('/sync', status_code=200, response_model=UserRead)  # Use POST for state-changing syncs
async def sync_user(
        db: SessionDep,
        token_data: TokenData = Depends(get_token_data)  # <--- The lean dependency
):
    try:
        logger.debug(f"Sync Attempt: {token_data.sub}: | Time: {utc_now()}")
        # 1. Check if user exists by Keycloak 'sub'
        user = await user_crud.get_or_create(db, obj_in=token_data)
        logger.debug(f"Sync Success: {user.id} | Time: {utc_now()}")
        return user
    except Exception as e:
        logger.error(f"Sync Failure | sub: {token_data.sub} | Error: {e}")
        raise HTTPException(status_code=500, detail="Sync failed")


@router.get("/me", response_model=UserRead)
async def read_current_user(db: SessionDep,current_user: TokenData = Depends(require_scopes(["user:read"]))):
    try:
        user = await user_crud.get(db, current_user.sub)
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User Not Found."
            )
        return user
    except Exception as e:
        logger.error(f"Error fetching user: {e}")
        raise HTTPException(status_code=500, detail="An error occurred, please try again later")

@router.patch("/me", status_code=200, response_model=UserRead)
async def update_current_user(db: SessionDep, user_data: UserUpdate, current_user: TokenData = Depends(require_scopes(['user:read']))):
    try:
        db_obj = await user_crud.get(db, current_user.sub)
        user = await user_crud.update(db, db_obj=db_obj, obj_in=user_data)
        await db.commit()
        return user
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise HTTPException(status_code=500, detail="An error occurred, please try again later")