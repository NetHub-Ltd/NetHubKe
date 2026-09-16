"""Unit tests for app.utils.helpers."""
from __future__ import annotations

from datetime import datetime, timezone

from app.utils.helpers import utc_now, utc_today, validate_and_format_kenyan_phone


def test_utc_now_aware():
    now = utc_now()
    assert now.tzinfo is not None
    assert abs((now - datetime.now(timezone.utc)).total_seconds()) < 5


def test_utc_today():
    today = utc_today()
    assert today.hour == 0 and today.minute == 0 and today.second == 0
    assert today.tzinfo is not None


def test_phone_valid_local():
    assert validate_and_format_kenyan_phone("0712345678") == "0712345678"
    assert validate_and_format_kenyan_phone("0712345678", format=True) == "+254712345678"


def test_phone_valid_international():
    assert validate_and_format_kenyan_phone("+254712345678", format=True) == "+254712345678"
    assert validate_and_format_kenyan_phone("254712345678", format=True) == "+254712345678"


def test_phone_invalid():
    assert validate_and_format_kenyan_phone("") is None
    assert validate_and_format_kenyan_phone("123") is None
    assert validate_and_format_kenyan_phone("0812345678") is None
    assert validate_and_format_kenyan_phone(None) is None  # type: ignore[arg-type]


def test_phone_with_spaces_and_dashes():
    assert validate_and_format_kenyan_phone("0712 345 678", format=True) == "+254712345678"
    assert validate_and_format_kenyan_phone("(0712)-345-678", format=True) == "+254712345678"
