"""Unit tests for subscription effectiveness and entitlement merge."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.domain.subscriptions import (
    is_subscription_effective,
    merge_entitlements,
)


def test_effective_active_not_expired():
    now = datetime(2026, 1, 10, tzinfo=timezone.utc)
    end = now + timedelta(days=5)
    assert is_subscription_effective(status="active", current_period_end=end, now=now)


def test_expired_not_effective():
    now = datetime(2026, 1, 10, tzinfo=timezone.utc)
    end = now - timedelta(seconds=1)
    assert not is_subscription_effective(status="active", current_period_end=end, now=now)


def test_canceled_not_effective():
    now = datetime(2026, 1, 10, tzinfo=timezone.utc)
    end = now + timedelta(days=5)
    assert not is_subscription_effective(status="canceled", current_period_end=end, now=now)


def test_merge_overrides_win():
    plan = [("a.cap", "boolean", "true"), ("b.cap", "quota", "10")]
    over = [("b.cap", "quota", "50")]
    merged = merge_entitlements(plan, over)
    by_cap = {c.capability: c for c in merged}
    assert by_cap["a.cap"].source == "plan"
    assert by_cap["b.cap"].value == "50"
    assert by_cap["b.cap"].source == "override"
