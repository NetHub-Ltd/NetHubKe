"""Merge OIDC scope and custom permissions claims (no settings dependency)."""
from __future__ import annotations

from typing import Any


def _as_space_separated(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, list):
        return " ".join(str(v) for v in value if v is not None and str(v).strip())
    return str(value).strip()


def merge_scope_claims(payload: dict[str, Any]) -> str:
    """
    Combine OIDC ``scope`` and custom ``permissions`` claims.

    Keycloak client scope ``api`` may put fine-grained rights in a hardcoded
    ``permissions`` claim (e.g. ``user:read user:write``) while the standard
    ``scope`` claim only contains the scope name ``api``. Using ``scope or
    permissions`` drops permissions whenever ``scope`` is non-empty.
    """
    scope_part = _as_space_separated(payload.get("scope"))
    perm_part = _as_space_separated(payload.get("permissions"))
    return f"{scope_part} {perm_part}".strip()
