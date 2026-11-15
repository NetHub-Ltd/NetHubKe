"""Subscription lifecycle and entitlement evaluation (request-time)."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Iterable

EFFECTIVE_STATUSES = frozenset({"trial", "active"})
ALL_STATUSES = frozenset({"trial", "active", "past_due", "canceled", "suspended"})


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def is_subscription_effective(
    *,
    status: str,
    current_period_end: datetime,
    now: datetime | None = None,
) -> bool:
    """Request-time check: status in effective set and period not ended."""
    n = now or utcnow()
    end = current_period_end
    if end.tzinfo is None:
        end = end.replace(tzinfo=timezone.utc)
    if n.tzinfo is None:
        n = n.replace(tzinfo=timezone.utc)
    return status in EFFECTIVE_STATUSES and end > n


@dataclass(frozen=True)
class CapabilityValue:
    capability: str
    value_type: str
    value: str
    source: str  # plan | override


def merge_entitlements(
    plan_rows: Iterable[tuple[str, str, str]],
    override_rows: Iterable[tuple[str, str, str]],
) -> list[CapabilityValue]:
    """Plan defaults, then overrides win on same capability."""
    merged: dict[str, CapabilityValue] = {}
    for cap, vtype, val in plan_rows:
        merged[cap] = CapabilityValue(cap, vtype, val, "plan")
    for cap, vtype, val in override_rows:
        merged[cap] = CapabilityValue(cap, vtype, val, "override")
    return [merged[k] for k in sorted(merged.keys())]


def next_period_end(start: datetime, *, days: int = 30) -> datetime:
    return start + timedelta(days=days)


def trial_window(start: datetime, trial_days: int) -> tuple[datetime, datetime | None]:
    if trial_days <= 0:
        return start, None
    end = start + timedelta(days=trial_days)
    return start, end
