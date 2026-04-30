from typing import Type, Any, Optional
from uuid import UUID
from pydantic import EmailStr

from sqlalchemy import Row
from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.crud.base import BaseCRUD
from app.db.schemas.schemas import TokenData
from app.db.schemas.schemas import UserCreate, UserUpdate, UserCreateBase
from app.db.models.models import User, Tenant
from app.utils.logging import logger

class UserCRUD(BaseCRUD[User, UserCreate, UserUpdate]):
    def __init__(self, model: Type[User]):
        super().__init__(model)

    async def get_by_email(self, db: AsyncSession, email: str) -> User:
        stmt = select(self.model).where(self.model.email == email)
        result = await db.exec(stmt)
        return result.first()

    async def get_or_create_tenancy(self, email: EmailStr, db: AsyncSession) -> Optional[Tenant]:
        stmt = select(Tenant).where(Tenant.email == email)
        result = await db.exec(stmt)
        tenant = result.first()
        if not tenant:
            tenant = Tenant(name=f'{email}-personal',email=email)
            db.add(tenant)
            await db.commit()
            await db.refresh(tenant)
            return tenant
        return tenant


    async def get_by_sub(self, db: AsyncSession, sub: UUID) -> Optional[User]:
        # 1. Define the statement
        statement = select(self.model).where(self.model.keycloak_id == sub)
        result = await db.exec(statement)
        return result.first()

    async def get_or_create(self, db: AsyncSession, obj_in: TokenData) -> User:
        # 1. Initial Check
        existing_user: User = await self.get_by_email(db, obj_in.email)
        if existing_user:
            logger.info(f"existing user: {existing_user.email}")
            return existing_user

        try:
            from app.db.models.models import Tenant

            # 2. Create Tenant
            personal_tenant = await self.get_or_create_tenancy(obj_in.email, db)
            # 3. Create User
            new_user_data = UserCreateBase(
                email=obj_in.email,
                keycloak_id=obj_in.sub,
                username=obj_in.username,
                full_name=obj_in.full_name,
                tenant_id=personal_tenant.id,
                is_active=True
            )

            db_obj = await self.create(db, obj_in=new_user_data)
            await db.commit()

            # ⚠️ CRITICAL: Refresh the object so it's usable after commit
            await db.refresh(db_obj)
            return db_obj

        except IntegrityError:
            await db.rollback()
            # Fallback: The user was created by a concurrent request.
            user = await self.get_by_sub(db, obj_in.sub)

            if not user:
                # If sub doesn't find them, the IntegrityError was likely an Email conflict.
                # You might want to log this or try get_by_email
                raise Exception(f"IntegrityError for {obj_in.email} but user not found by sub.")

            return user




user_crud = UserCRUD(User)