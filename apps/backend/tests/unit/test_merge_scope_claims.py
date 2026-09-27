"""merge_scope_claims: OIDC scope + custom permissions must both apply."""
from __future__ import annotations

from app.core.scope_claims import merge_scope_claims
from app.db.schemas.schemas import TokenData


def test_merge_scope_and_permissions_like_api_client_scope():
    """Regression: api scope name in scope + user:read in permissions."""
    raw = merge_scope_claims(
        {
            "scope": "openid profile email api",
            "permissions": "user:read user:write",
        }
    )
    td = TokenData.model_validate(
        {
            "sub": "00000000-0000-4000-8000-000000000099",
            "email": "u@example.com",
            "preferred_username": "u",
            "name": "U",
            "email_verified": True,
            "scope": raw,
        }
    )
    assert "api" in td.scopes
    assert "user:read" in td.scopes
    assert "user:write" in td.scopes
    assert "openid" not in td.scopes


def test_scope_only_unchanged():
    raw = merge_scope_claims({"scope": "openid user:read"})
    td = TokenData.model_validate(
        {
            "sub": "00000000-0000-4000-8000-000000000099",
            "email": "u@example.com",
            "preferred_username": "u",
            "name": "U",
            "email_verified": True,
            "scope": raw,
        }
    )
    assert td.scopes == ["user:read"]


def test_permissions_only():
    raw = merge_scope_claims({"permissions": "user:read"})
    td = TokenData.model_validate(
        {
            "sub": "00000000-0000-4000-8000-000000000099",
            "email": "u@example.com",
            "preferred_username": "u",
            "name": "U",
            "email_verified": True,
            "scope": raw,
        }
    )
    assert "user:read" in td.scopes


def test_list_claims():
    raw = merge_scope_claims(
        {"scope": ["openid", "api"], "permissions": ["user:read", "user:write"]}
    )
    assert "api" in raw.split()
    assert "user:read" in raw.split()
