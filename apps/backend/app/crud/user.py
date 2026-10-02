from typing import Type, Optional
from uuid import UUID

from pydantic import EmailStr
from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.crud.base import BaseCRUD
from app.db.models.models import User, Tenant
from app.db.schemas.schemas import UserCreate, UserUpdate, UserCreateBase, TokenData
from app.utils.logging import logger


def _norm_email(email: str) -> str:
    return (email or "").strip().lower()


class UserCRUD(BaseCRUD[User, UserCreate, UserUpdate]):
    def __init__(self, model: Type[User]):
        super().__init__(model)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        stmt = select(self.model).where(self.model.email == _norm_email(email))
        result = await db.exec(stmt)
        return result.first()

    async def get_by_id(self, db: AsyncSession, user_id: UUID) -> Optional[User]:
        stmt = select(self.model).where(self.model.id == user_id)
        result = await db.exec(stmt)
        return result.first()

    async def get_or_create_tenancy(
        self, email: EmailStr, db: AsyncSession
    ) -> Optional[Tenant]:
        email_n = _norm_email(str(email))
        stmt = select(Tenant).where(Tenant.email == email_n)
        result = await db.exec(stmt)
        tenant = result.first()
        if not tenant:
            tenant = Tenant(name=f"{email_n}-personal", email=email_n)
            db.add(tenant)
            await db.commit()
            await db.refresh(tenant)
            return tenant
        return tenant

    async def get_or_create(self, db: AsyncSession, obj_in: TokenData) -> User:
        """Find or create user by email only. Local UUID is the primary key."""
        email = _norm_email(str(obj_in.email))
        if not email:
            raise ValueError("email is required to sync a user")

        existing = await self.get_by_email(db, email)
        if existing:
            logger.info(f"existing user: {existing.email}")
            # Light profile refresh from IdP claims when blank
            dirty = False
            if obj_in.full_name and not (existing.full_name or "").strip():
                existing.full_name = obj_in.full_name
                dirty = True
            if obj_in.username and not (existing.username or "").strip():
                existing.username = obj_in.username
                dirty = True
            if not existing.is_active:
                existing.is_active = True
                dirty = True
            if dirty:
                db.add(existing)
                await db.commit()
                await db.refresh(existing)
            return existing

        try:
            personal_tenant = await self.get_or_create_tenancy(email, db)
            username = (obj_in.username or email.split("@")[0] or "user").strip()
            full_name = (obj_in.full_name or username).strip()
            new_user_data = UserCreateBase(
                email=email,
                username=username,
                full_name=full_name,
                tenant_id=personal_tenant.id if personal_tenant else None,
                is_active=True,
            )
            db_obj = await self.create(db, obj_in=new_user_data)
            await db.commit()
            await db.refresh(db_obj)
            logger.info(f"created user: {db_obj.id} email={db_obj.email}")
            return db_obj
        except IntegrityError:
            await db.rollback()
            user = await self.get_by_email(db, email)
            if not user:
                raise Exception(
                    f"IntegrityError for {email} but user not found by email"
                )
            return user


user_crud = UserCRUD(User)
