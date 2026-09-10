from fastapi import APIRouter, Depends, HTTPException
from loguru import logger
from sqlalchemy.orm import selectinload
from sqlmodel import select

from app.api.deps import require_scopes, SessionDep, get_token_data
from app.crud.user import user_crud
from app.db.models.models import User
from app.db.schemas.schemas import TokenData
from app.db.schemas.schemas import UserRead, UserUpdate
from app.utils.helpers import utc_now

router = APIRouter()


def _to_user_read(user: User) -> UserRead:
    """Map ORM User (+ optional tenant relationship) to the public UserRead schema."""
    tenant = getattr(user, "tenant", None)
    return UserRead(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        username=user.username or "",
        phone_number=user.phone_number,
        is_active=user.is_active,
        tenant_id=user.tenant_id,
        tenant_name=tenant.name if tenant else None,
        tenant_tier=tenant.tier.value if tenant and hasattr(tenant.tier, "value") else (str(tenant.tier) if tenant else None),
        created_at=user.created_at,
    )


@router.post('/sync', status_code=200, response_model=UserRead)  # Use POST for state-changing syncs
async def sync_user(
        db: SessionDep,
        token_data: TokenData = Depends(get_token_data)  # <--- The lean dependency
):
    try:
        logger.debug(f"Sync Attempt: {token_data.sub}: | Time: {utc_now()}")
        # 1. Check if user exists by Keycloak 'sub'
        user = await user_crud.get_or_create(db, obj_in=token_data)
        # Reload with tenant for complete profile payload
        stmt = select(User).where(User.id == user.id).options(selectinload(User.tenant))
        result = await db.exec(stmt)
        user = result.first() or user
        logger.debug(f"Sync Success: {user.id} | Time: {utc_now()}")
        return _to_user_read(user)
    except Exception as e:
        logger.error(f"Sync Failure | sub: {token_data.sub} | Error: {e}")
        raise HTTPException(status_code=500, detail="Sync failed")


@router.get("/me", response_model=UserRead)
async def read_current_user(db: SessionDep, current_user: TokenData = Depends(require_scopes(["user:read"]))):
    try:
        # Lookup by Keycloak sub (not primary key)
        stmt = (
            select(User)
            .where(User.keycloak_id == current_user.sub)
            .options(selectinload(User.tenant))
        )
        result = await db.exec(stmt)
        user = result.first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="User Not Found."
            )
        return _to_user_read(user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user: {e}")
        raise HTTPException(status_code=500, detail="An error occurred, please try again later")


@router.patch("/me", status_code=200, response_model=UserRead)
async def update_current_user(db: SessionDep, user_data: UserUpdate, current_user: TokenData = Depends(require_scopes(['user:write']))):
    try:
        db_obj = await user_crud.get_by_sub(db, current_user.sub)
        if not db_obj:
            raise HTTPException(status_code=404, detail="User Not Found.")
        user = await user_crud.update(db, db_obj=db_obj, obj_in=user_data)
        await db.commit()
        # Reload with tenant
        stmt = select(User).where(User.id == user.id).options(selectinload(User.tenant))
        result = await db.exec(stmt)
        user = result.first() or user
        return _to_user_read(user)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating user: {e}")
        raise HTTPException(status_code=500, detail="An error occurred, please try again later")
