"""User + identity resolution (Architecture A)."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.models.models import User, UserIdentity
from app.db.schemas.schemas import TokenData, UserUpdate


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def get_identity(
    session: AsyncSession, *, issuer: str, subject: str
) -> UserIdentity | None:
    result = await session.execute(
        select(UserIdentity).where(
            UserIdentity.issuer == issuer,
            UserIdentity.subject == subject,
        )
    )
    return result.scalar_one_or_none()


async def get_user_by_id(session: AsyncSession, user_id) -> User | None:
    result = await session.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


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
        # Refresh profile fields from token when present
        if token.email and token.email != user.email:
            # Do not change email on existing identity path without explicit policy
            pass
        if token.name:
            user.full_name = token.name
        if token.preferred_username:
            user.username = token.preferred_username
        user.updated_at = _utcnow()
        session.add(user)
        await session.commit()
        await session.refresh(user)
        return user

    email = token.email
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token missing email; cannot provision user",
        )

    existing = await get_user_by_email(session, email)
    if existing is not None:
        # Same email, different subject → conflict (no silent link)
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
    session.add(user)
    try:
        await session.flush()
        identity = UserIdentity(issuer=issuer, subject=subject, user_id=user.id)
        session.add(identity)
        await session.commit()
    except IntegrityError as exc:
        await session.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Identity or email conflict",
        ) from exc
    await session.refresh(user)
    return user


async def resolve_user_from_token(session: AsyncSession, token: TokenData) -> User:
    issuer = (token.issuer or "").rstrip("/")
    identity = await get_identity(session, issuer=issuer, subject=token.sub)
    if identity is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not synced; call POST /api/v1/users/sync first",
        )
    user = await get_user_by_id(session, identity.user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive",
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
