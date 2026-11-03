"""Normalize standard OIDC role/group claims using configured claim mapping."""

from __future__ import annotations

from typing import Any


def _read_claim_path(payload: dict[str, Any], claim_path: str) -> Any:
    """Read a configured dot-separated claim path without provider-specific logic."""
    value: Any = payload
    for part in (segment for segment in claim_path.split(".") if segment):
        if not isinstance(value, dict):
            return None
        value = value.get(part)
    return value


def _claim_values(value: Any, *, allow_string: bool = True) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value if item is not None and str(item).strip()]
    if isinstance(value, dict):
        return [str(key) for key in value if str(key).strip()]
    if allow_string and isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def extract_roles(payload: dict[str, Any], claim_path: str = "roles") -> list[str]:
    """
    Normalize roles from the configured claim and groups claim.

    Provider-specific claim names/paths are supplied through OIDC_ROLE_CLAIM_PATH;
    this module intentionally contains no provider names or vendor claim schemas.
    """
    found: list[str] = []
    if claim_path.strip():
        found.extend(_claim_values(_read_claim_path(payload, claim_path.strip())))
    found.extend(_claim_values(payload.get("groups"), allow_string=False))

    seen: set[str] = set()
    normalized: list[str] = []
    for role in found:
        if role not in seen:
            seen.add(role)
            normalized.append(role)
    return normalized
