"""Async Redis client for AS caches (JWKS, signing kid, entitlements)."""
from __future__ import annotations

from functools import lru_cache
from typing import Optional

import redis.asyncio as redis

from app.core.config import settings
from app.utils.logging import logger

_client: Optional[redis.Redis] = None


def get_redis() -> redis.Redis:
    global _client
    if _client is None:
        url = getattr(settings, "redis_url", None) or "redis://localhost:6379/0"
        _client = redis.from_url(url, decode_responses=True)
        logger.info("Redis client initialized")
    return _client


async def redis_get(key: str) -> Optional[str]:
    try:
        return await get_redis().get(key)
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"redis get failed key={key}: {exc}")
        return None


async def redis_set(key: str, value: str, ttl: int) -> None:
    try:
        await get_redis().set(key, value, ex=max(1, ttl))
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"redis set failed key={key}: {exc}")


async def redis_delete(*keys: str) -> None:
    try:
        if keys:
            await get_redis().delete(*keys)
    except Exception as exc:  # noqa: BLE001
        logger.warning(f"redis delete failed: {exc}")


JWKS_CACHE_KEY = "nethub:as:jwks"
ACTIVE_KID_CACHE_KEY = "nethub:as:signing:active_kid"


async def ensure_redis_ready(timeout_sec: float = 5.0) -> None:
    """
    Hard readiness check: Redis must answer PING.

    Raises RuntimeError if Redis is unreachable or not ready.
    Connection alone is not enough — we require a successful PING.
    """
    import asyncio

    client = get_redis()
    try:
        pong = await asyncio.wait_for(client.ping(), timeout=timeout_sec)
        if not pong:
            raise RuntimeError("Redis PING returned falsy")
        logger.info("Redis readiness verified (PING ok)")
    except Exception as exc:  # noqa: BLE001
        logger.critical(f"Redis not ready: {exc}")
        raise RuntimeError(f"Redis unavailable or not ready: {exc}") from exc
