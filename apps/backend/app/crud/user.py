"""User + identity resolution (Architecture A)."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import get_settings
from app.db.models.models import User, UserIdentity
from app.db.schemas.schemas import TokenData, UserUpdate


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _maybe_bootstrap_admin(user: User) -> None:
    emails = get_settings().admin_bootstrap_emails
    if emails and user.email.lower() in emails:
        user.is_admin = True


async def get_identity(
    session: AsyncSession, *, issuer: str, subject: str
) -> UserIdentity | None:
    result = await session.exec(
        select(UserIdentity).where(
            UserIdentity.issuer == issuer,
            UserIdentity.subject == subject,
        )
    )
    return result.first()


async def get_user_by_id(session: AsyncSession, user_id) -> User | None:
    result = await session.exec(select(User).where(User.id == user_id))
    return result.first()


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.exec(select(User).where(User.email == email))
    return result.first()


async def sync_user_from_token(session: AsyncSession, token: TokenData) -> User:
    """Idempotent provision: (issuer, sub) → local user."""
    issuer = (token.issuer or "").rstrip("/")
    if not issuer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing issuer",
        )
    subject = token.sub

    identity = await get_identity(session, issuer=issuer, subject=subject)
    if identity is not None:
        user = await get_user_by_id(session, identity.user_id)
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Identity points to missing user",
            )
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User is inactive",
            )
        if token.name:
            user.full_name = token.name
        if token.preferred_username:
            user.username = token.preferred_username
        _maybe_bootstrap_admin(user)
        user.updated_at = _utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    email = (token.email or "").strip().lower()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token missing email; cannot provision user",
        )

    existing = await get_user_by_email(session, email)
    if existing is not None:
        other = await session.exec(
            select(UserIdentity).where(
                UserIdentity.user_id == existing.id,
                UserIdentity.issuer == issuer,
            )
        )
        if other.first() is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already linked to a different identity",
            )

    user = User(
        email=email,
        username=token.preferred_username or email.split("@")[0],
        full_name=token.name or "",
        is_active=True,
    )
    _maybe_bootstrap_admin(user)
    session.add(user)
    try:
        await session.flush()
        session.add(
            UserIdentity(issuer=issuer, subject=subject, user_id=user.id)
        )
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Could not provision user (conflict)",
        ) from exc
    await session.refresh(user)
    return user


async def resolve_user_from_token(session: AsyncSession, token: TokenData) -> User:
    issuer = (token.issuer or "").rstrip("/")
    identity = await get_identity(session, issuer=issuer, subject=token.sub)
    if identity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not provisioned; call POST /users/sync first",
        )
    user = await get_user_by_id(session, identity.user_id)
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User unavailable",
        )
    return user


async def update_user(session: AsyncSession, user: User, body: UserUpdate) -> User:
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(user, key, value)
    user.updated_at = _utcnow()
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user
