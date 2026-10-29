from typing import Type, Optional
from uuid import UUID

from pydantic import EmailStr
from sqlalchemy.exc import IntegrityError
from fastapi import HTTPException, status
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.crud.base import BaseCRUD
from app.db.models.models import User, Tenant, UserIdentity
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

    async def get_by_upstream_identity(
        self, db: AsyncSession, *, issuer: str, subject: str
    ) -> Optional[User]:
        issuer_n = (issuer or "").strip().rstrip("/")
        subject_n = (subject or "").strip()
        if not issuer_n or not subject_n:
            return None
        result = await db.exec(
            select(UserIdentity).where(
                UserIdentity.issuer == issuer_n,
                UserIdentity.subject == subject_n,
                UserIdentity.deleted_at.is_(None),
            )
        )
        identity = result.first()
        return await self.get_by_id(db, identity.user_id) if identity else None

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
        """Sync only a verified issuer+subject identity; never auto-link by email."""
        email = _norm_email(str(obj_in.email))
        issuer = (obj_in.issuer or "").strip().rstrip("/")
        subject = (obj_in.sub or "").strip()
        if not issuer or not subject:
            raise HTTPException(status_code=401, detail="Validated issuer and subject are required")

        mapped = await self.get_by_upstream_identity(db, issuer=issuer, subject=subject)
        if mapped:
            if not mapped.is_active:
                return mapped
            dirty = False
            if obj_in.full_name and not (mapped.full_name or "").strip():
                mapped.full_name = obj_in.full_name
                dirty = True
            if obj_in.username and not (mapped.username or "").strip():
                mapped.username = obj_in.username
                dirty = True
            if dirty:
                db.add(mapped)
                await db.commit()
                await db.refresh(mapped)
            return mapped

        existing_email_user = await self.get_by_email(db, email) if email else None
        if existing_email_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This email already belongs to a local account. Explicitly link the verified identity before sync.",
            )
        if not email:
            raise ValueError("email is required to sync a user")


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
            db.add(UserIdentity(issuer=issuer, subject=subject, user_id=db_obj.id))
            await db.commit()
            logger.info(f"created user: {db_obj.id} issuer={issuer} subject_mapping_created=true")
            return db_obj
        except IntegrityError as exc:
            await db.rollback()
            mapped = await self.get_by_upstream_identity(db, issuer=issuer, subject=subject)
            if mapped:
                return mapped
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Identity or account creation conflicted; explicit identity linking is required",
            ) from exc


user_crud = UserCRUD(User)
