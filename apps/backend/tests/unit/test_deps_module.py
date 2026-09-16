"""Deps module import + require_scopes logic (no live auth)."""
from __future__ import annotations

import uuid

import pytest
from fastapi import HTTPException

from app.api import deps
from app.db.schemas.schemas import TokenData


def test_deps_exports():
    assert hasattr(deps, "get_current_user")
    assert hasattr(deps, "require_scopes")
    assert hasattr(deps, "get_session")


def _user(scopes: str) -> TokenData:
    return TokenData(
        sub=uuid.uuid4(),
        email="a@b.com",
        preferred_username="a",
        name="A",
        email_verified=True,
        roles=["user"],
        scope=scopes,
    )


def test_require_scopes_all_ok():
    user = _user("openid user:read admin:write")
    verifier = deps.require_scopes(["user:read", "admin:write"], all_required=True)
    result = verifier(user=user)
    assert result is user


def test_require_scopes_all_fail():
    user = _user("openid")
    verifier = deps.require_scopes(["admin:write"], all_required=True)
    with pytest.raises(HTTPException) as ei:
        verifier(user=user)
    assert ei.value.status_code == 403


def test_require_scopes_any_ok():
    user = _user("user:read")
    verifier = deps.require_scopes(["user:read", "admin:write"], all_required=False)
    assert verifier(user=user) is user


def test_token_data_has_permission():
    user = _user("user:read admin:write")
    assert user.has_permission("user:read")
    assert not user.has_permission("missing")
    assert user.has_role("user")
