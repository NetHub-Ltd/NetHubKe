"""PostgreSQL-backed N5 signing-key concurrency acceptance tests."""
from __future__ import annotations

import asyncio
from datetime import datetime, timedelta, timezone

import pytest
from sqlalchemy.ext.asyncio import async_sessionmaker
from sqlmodel import select

from app.db.models.models import SecurityAuditEvent, SigningKey
from app.services.tawala_token import ensure_fresh_signing_key, rotate_signing_key


@pytest.mark.asyncio
@pytest.mark.integration
async def test_concurrent_manual_rotations_leave_exactly_one_active_key(test_engine, db_session):
    """Independent PostgreSQL sessions serialize rotation state transitions."""
    from app.services.tawala_token import _generate_rsa_keypair

    kid, pem, jwk, _ = _generate_rsa_keypair()
    db_session.add(SigningKey(kid=kid, status="active", algorithm="RS256", private_pem=pem, public_jwk=jwk))
    await db_session.commit()

    sessions = async_sessionmaker(test_engine, expire_on_commit=False, autoflush=False)
    start = asyncio.Event()

    async def rotate():
        async with sessions() as session:
            await start.wait()
            return await rotate_signing_key(session, retire_after_hours=1, actor_sub="concurrency-test")

    tasks = [asyncio.create_task(rotate()) for _ in range(4)]
    start.set()
    results = await asyncio.gather(*tasks)

    active = (await db_session.exec(select(SigningKey).where(SigningKey.status == "active"))).all()
    audits = (await db_session.exec(select(SecurityAuditEvent).where(SecurityAuditEvent.action == "signing_key.rotate"))).all()
    assert len(active) == 1
    assert len({result["new_kid"] for result in results}) == 4
    assert len(audits) == 4


@pytest.mark.asyncio
@pytest.mark.integration
async def test_concurrent_auto_rotation_only_replaces_stale_key_once(test_engine, db_session):
    """Workers that observed the same stale key re-check freshness under lock."""
    from app.services.tawala_token import _generate_rsa_keypair
    from app.core.config import settings

    kid, pem, jwk, _ = _generate_rsa_keypair()
    stale = SigningKey(kid=kid, status="active", algorithm="RS256", private_pem=pem, public_jwk=jwk)
    stale.created_at = datetime.now(timezone.utc) - timedelta(days=10)
    db_session.add(stale)
    await db_session.commit()

    sessions = async_sessionmaker(test_engine, expire_on_commit=False, autoflush=False)
    start = asyncio.Event()

    async def rotate_if_needed():
        async with sessions() as session:
            await start.wait()
            await ensure_fresh_signing_key(session)

    tasks = [asyncio.create_task(rotate_if_needed()) for _ in range(4)]
    start.set()
    await asyncio.gather(*tasks)

    active = (await db_session.exec(select(SigningKey).where(SigningKey.status == "active"))).all()
    audits = (await db_session.exec(select(SecurityAuditEvent).where(SecurityAuditEvent.action == "signing_key.rotate"))).all()
    assert len(active) == 1
    assert len(audits) == 1
