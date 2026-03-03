import re
from datetime import datetime, timezone
from typing import Optional


def utc_now() -> datetime:
    """Return current UTC time as a timezone-aware datetime."""
    return datetime.now(timezone.utc)


def utc_today() -> datetime:
    """Return today's date in UTC (00:00:00)."""
    now = utc_now()
    return datetime(year=now.year, month=now.month, day=now.day, tzinfo=timezone.utc)


def validate_and_format_kenyan_phone(phone: str, format: bool = False) -> Optional[str]:
    """
    Validates a Kenyan phone number (07xx or 01xx, 10 digits total).
    Accepts local format (07... / 01...) and international (+254... / 254...).

    Args:
        phone: The phone number string
        format: If True → returns international format (+2547xx...) if valid
                If False → returns the original cleaned string if valid

    Returns:
        str: formatted/validated phone number if valid
        None: if invalid
    """
    if not phone:
        return None

    # Remove whitespace, dashes, parentheses, etc.
    cleaned = re.sub(r"[\s\-\_\(\)]", "", phone.strip())

    # Pattern: optional +254 / 0 prefix + exactly 9 digits starting with 7 or 1
    pattern = r"^(\+254|0)?(7[0-9]{8}|1[0-9]{8})$"

    match = re.match(pattern, cleaned)
    if not match:
        return None

    # The actual 9-digit part (after prefix)
    digits = match.group(2)

    if format:
        # Return international format
        return f"254{digits}"
    else:
        # Return cleaned local format (with 0 prefix)
        return f"0{digits}"
