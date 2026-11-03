"""A2: identity model constraints and AsyncSession round-trip."""
from __future__ import annotations

import uuid

import pytest
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.db.models.models import Tenant, User, UserIdentity
from app.db.session import AsyncSessionLocal, engine
from sqlmodel import SQLModel


@pytest.fixture(autouse=True)
async def prepare_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)


@pytest.mark.asyncio
async def test_create_user_and_identity_round_trip():
    async with AsyncSessionLocal() as session:
        user = User(email="a@example.com", username="a", full_name="A User", is_active=True)
        session.add(user)
        await session.commit()
        await session.refresh(user)

        identity = UserIdentity(
            issuer="https://idp.test/realms/nethub",
            subject="sub-123",
            user_id=user.id,
        )
        session.add(identity)
        await session.commit()

        result = await session.execute(select(UserIdentity).where(UserIdentity.user_id == user.id))
        row = result.scalar_one()
        assert row.subject == "sub-123"
        assert row.issuer.endswith("nethub")


@pytest.mark.asyncio
async def test_unique_issuer_subject():
    async with AsyncSessionLocal() as session:
        u1 = User(email="u1@example.com", username="u1", full_name="U1", is_active=True)
        u2 = User(email="u2@example.com", username="u2", full_name="U2", is_active=True)
        session.add(u1)
        session.add(u2)
        await session.commit()
        await session.refresh(u1)
        await session.refresh(u2)

        session.add(
            UserIdentity(issuer="https://idp.test", subject="same-sub", user_id=u1.id)
        )
        await session.commit()

        session.add(
            UserIdentity(issuer="https://idp.test", subject="same-sub", user_id=u2.id)
        )
        with pytest.raises(IntegrityError):
            await session.commit()
        await session.rollback()


@pytest.mark.asyncio
async def test_unique_user_issuer():
    async with AsyncSessionLocal() as session:
        user = User(email="one@example.com", username="one", full_name="One", is_active=True)
        session.add(user)
        await session.commit()
        await session.refresh(user)

        session.add(
            UserIdentity(issuer="https://idp.test", subject="sub-a", user_id=user.id)
        )
        await session.commit()

        session.add(
            UserIdentity(issuer="https://idp.test", subject="sub-b", user_id=user.id)
        )
        with pytest.raises(IntegrityError):
            await session.commit()
        await session.rollback()


@pytest.mark.asyncio
async def test_tenant_optional_on_user():
    async with AsyncSessionLocal() as session:
        tenant = Tenant(name="Acme", email="ops@acme.test")
        session.add(tenant)
        await session.commit()
        await session.refresh(tenant)

        user = User(
            email="member@acme.test",
            username="member",
            full_name="Member",
            is_active=True,
            tenant_id=tenant.id,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)
        assert user.tenant_id == tenant.id
