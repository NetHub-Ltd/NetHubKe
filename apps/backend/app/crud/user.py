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
        stmt = select(self.model).where(
            self.model.email == _norm_email(email),
            self.model.deleted_at.is_(None),
        )
        result = await db.exec(stmt)
        return result.first()

    async def get_by_upstream_identity(
        self, db: AsyncSession, *, issuer: str, subject: str
    ) -> Optional[User]:
        issuer_n = (issuer or "").strip().rstrip("/")
        # OIDC sub is opaque and case-sensitive: preserve it byte-for-byte.
        subject_n = subject or ""
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
        stmt = select(self.model).where(
            self.model.id == user_id,
            self.model.deleted_at.is_(None),
        )
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
            # Keep tenant creation in the caller's transaction. User and
            # UserIdentity must commit or roll back with this tenant together.
            await db.flush()
            return tenant
        return tenant

    async def get_or_create(self, db: AsyncSession, obj_in: TokenData) -> User:
        """Sync only a verified issuer+subject identity; never auto-link by email."""
        email = _norm_email(str(obj_in.email))
        issuer = (obj_in.issuer or "").strip().rstrip("/")
        # Do not normalize an opaque OIDC subject; only the issuer is normalized.
        subject = obj_in.sub or ""
        if not issuer or not subject:
            raise HTTPException(status_code=401, detail="Validated issuer and subject are required")

        mapped = await self.get_by_upstream_identity(db, issuer=issuer, subject=subject)
        if mapped:
            if not mapped.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Account is disabled. Please contact NetHub support.",
                )

            dirty = False
            # Email is mutable profile data, never an identity lookup key. Only
            # accept an upstream change when the IdP explicitly verifies it.
            if obj_in.email_verified and email and email != _norm_email(mapped.email):
                email_owner = await self.get_by_email(db, email)
                if email_owner is not None and email_owner.id != mapped.id:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Verified email already belongs to another local account.",
                    )
                mapped.email = email
                dirty = True

            if obj_in.full_name and not (mapped.full_name or "").strip():
                mapped.full_name = obj_in.full_name
                dirty = True
            if obj_in.username and not (mapped.username or "").strip():
                mapped.username = obj_in.username
                dirty = True
            if dirty:
                db.add(mapped)
                try:
                    await db.commit()
                    await db.refresh(mapped)
                except IntegrityError as exc:
                    await db.rollback()
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail="Profile update conflicts with an existing account.",
                    ) from exc
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
            # Persist the local account and its canonical identity mapping in one
            # transaction so a failed mapping insert cannot leave an orphan user.
            db_obj = User.model_validate(new_user_data)
            db.add(db_obj)
            await db.flush()
            db.add(UserIdentity(issuer=issuer, subject=subject, user_id=db_obj.id))
            await db.commit()
            await db.refresh(db_obj)
            logger.info(f"created user: {db_obj.id} issuer={issuer} subject_mapping_created=true")
            return db_obj
        except IntegrityError as exc:
            await db.rollback()
            mapped = await self.get_by_upstream_identity(db, issuer=issuer, subject=subject)
            if mapped:
                if not mapped.is_active:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Account is disabled. Please contact NetHub support.",
                    )
                return mapped
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Identity or account creation conflicted; explicit identity linking is required",
            ) from exc


user_crud = UserCRUD(User)
