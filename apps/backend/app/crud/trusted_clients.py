"""Trusted OIDC client allowlist."""
from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.config import settings
from app.core.redis_client import cache_delete, cache_get, cache_set
from app.db.models.models import TrustedClient

CACHE_KEY = "nethub:trusted_clients:active_ids"


async def list_active_client_ids(session: AsyncSession) -> set[str]:
    cached = cache_get(CACHE_KEY)
    if cached is not None:
        try:
            return set(json.loads(cached))
        except json.JSONDecodeError:
            pass

    result = await session.exec(
        select(TrustedClient).where(
            TrustedClient.is_active == True,  # noqa: E712
        )
    )
    rows = [c for c in result.all() if c.revoked_at is None]
    ids = {c.client_id for c in rows}

    # Bootstrap from env when table empty
    if not ids and settings.bootstrap_audiences:
        for cid in settings.bootstrap_audiences:
            session.add(
                TrustedClient(
                    client_id=cid,
                    name=f"Bootstrap {cid[:12]}",
                    product="bootstrap",
                    is_active=True,
                )
            )
        await session.commit()
        ids = set(settings.bootstrap_audiences)

    cache_set(CACHE_KEY, json.dumps(sorted(ids)), settings.trusted_clients_cache_ttl)
    return ids


async def is_client_trusted(session: AsyncSession, client_ids: list[str]) -> bool:
    if not client_ids:
        return False
    active = await list_active_client_ids(session)
    return any(c in active for c in client_ids)


async def create_client(session: AsyncSession, *, client_id: str, name: str, product: str, notes: str) -> TrustedClient:
    row = TrustedClient(client_id=client_id, name=name, product=product, notes=notes, is_active=True)
    session.add(row)
    await session.commit()
    await session.refresh(row)
    cache_delete(CACHE_KEY)
    return row


async def revoke_client(session: AsyncSession, client_id: str) -> TrustedClient | None:
    result = await session.exec(select(TrustedClient).where(TrustedClient.client_id == client_id))
    row = result.first()
    if not row:
        return None
    row.is_active = False
    row.revoked_at = datetime.now(timezone.utc)
    session.add(row)
    await session.commit()
    await session.refresh(row)
    cache_delete(CACHE_KEY)
    return row


async def list_clients(session: AsyncSession) -> list[TrustedClient]:
    result = await session.exec(select(TrustedClient).order_by(TrustedClient.created_at.desc()))
    return list(result.all())
