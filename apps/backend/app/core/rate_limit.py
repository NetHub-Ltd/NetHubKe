"""SlowAPI rate limiter shared across the app."""
from __future__ import annotations

from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings


def _key_func(request) -> str:  # noqa: ANN001
    return get_remote_address(request)


# enabled flag checked by decorators / route setup
limiter = Limiter(
    key_func=_key_func,
    default_limits=[],
    enabled=settings.rate_limit_enabled,
)
