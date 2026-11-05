"""Optional Redis — used for trusted-client cache; degrades to no-cache if unavailable."""
from __future__ import annotations

from typing import Optional

from app.core.config import settings
from app.core.logging import get_logger

log = get_logger("redis")

_client = None


def get_redis():
    global _client
    if not settings.redis_url:
        return None
    if _client is not None:
        return _client
    try:
        import redis

        _client = redis.Redis.from_url(settings.redis_url, decode_responses=True, socket_timeout=2)
        _client.ping()
        log.info("redis_connected")
        return _client
    except Exception as exc:  # noqa: BLE001
        log.warning("redis_unavailable error={}", exc)
        _client = None
        return None


def cache_get(key: str) -> Optional[str]:
    r = get_redis()
    if not r:
        return None
    try:
        return r.get(key)
    except Exception:  # noqa: BLE001
        return None


def cache_set(key: str, value: str, ttl: int) -> None:
    r = get_redis()
    if not r:
        return
    try:
        r.setex(key, ttl, value)
    except Exception:  # noqa: BLE001
        pass


def cache_delete(key: str) -> None:
    r = get_redis()
    if not r:
        return
    try:
        r.delete(key)
    except Exception:  # noqa: BLE001
        pass
