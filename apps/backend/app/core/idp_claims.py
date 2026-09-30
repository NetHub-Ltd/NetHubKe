"""IdP-agnostic role extraction from OIDC access/ID token payloads."""
from __future__ import annotations

from typing import Any


def extract_roles(payload: dict[str, Any]) -> list[str]:
    """
    Collect roles from common IdP claim shapes without preferring one vendor.

    Order (first non-empty wins as primary source; all unique merged):
    - Keycloak: realm_access.roles
    - Zitadel: urn:zitadel:iam:org:project:roles (map keys) or "roles"
    - Generic: groups (string list)
    """
    found: list[str] = []

    realm = payload.get("realm_access")
    if isinstance(realm, dict):
        roles = realm.get("roles")
        if isinstance(roles, list):
            found.extend(str(r) for r in roles if r is not None)

    # Zitadel project roles: {"projectId": {"roleName": ...}} or similar
    zitadel_roles = payload.get("urn:zitadel:iam:org:project:roles")
    if isinstance(zitadel_roles, dict):
        found.extend(str(k) for k in zitadel_roles.keys())
    elif isinstance(zitadel_roles, list):
        found.extend(str(r) for r in zitadel_roles if r is not None)

    top_roles = payload.get("roles")
    if isinstance(top_roles, list):
        found.extend(str(r) for r in top_roles if r is not None)
    elif isinstance(top_roles, dict):
        found.extend(str(k) for k in top_roles.keys())

    groups = payload.get("groups")
    if isinstance(groups, list):
        found.extend(str(g) for g in groups if g is not None)

    # de-dupe preserve order
    seen: set[str] = set()
    out: list[str] = []
    for r in found:
        if r and r not in seen:
            seen.add(r)
            out.append(r)
    return out
