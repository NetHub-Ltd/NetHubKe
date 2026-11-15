"""Append-only audit event recording."""
from __future__ import annotations

import json
import re
import uuid
from typing import Any

from sqlmodel.ext.asyncio.session import AsyncSession

from app.db.models.models import AuditEvent

_SENSITIVE = re.compile(
    r"(?i)(bearer\s+[a-z0-9\-._~+/]+=*|authorization|password|secret|token|api[_-]?key)"
)


def _redact(text: str) -> str:
    if not text:
        return ""
    return _SENSITIVE.sub("[REDACTED]", text)


def _detail_json(data: dict[str, Any] | None) -> str:
    if not data:
        return ""
    safe = {k: v for k, v in data.items() if k.lower() not in {"token", "password", "secret", "authorization"}}
    raw = json.dumps(safe, default=str)
    return _redact(raw)[:4000]


async def record_event(
    session: AsyncSession,
    *,
    action: str,
    actor_user_id: uuid.UUID | None = None,
    actor_type: str = "user",
    target_type: str = "",
    target_id: str = "",
    organization_id: uuid.UUID | None = None,
    outcome: str = "success",
    detail: dict[str, Any] | None = None,
    correlation_id: str = "",
    commit: bool = False,
) -> AuditEvent:
    """Write an audit row. Caller may commit with surrounding work or set commit=True."""
    event = AuditEvent(
        actor_user_id=actor_user_id,
        actor_type=actor_type,
        action=action,
        target_type=target_type,
        target_id=str(target_id) if target_id is not None else "",
        organization_id=organization_id,
        outcome=outcome,
        detail=_detail_json(detail),
        correlation_id=correlation_id or "",
    )
    session.add(event)
    if commit:
        await session.commit()
        await session.refresh(event)
    else:
        await session.flush()
    return event
