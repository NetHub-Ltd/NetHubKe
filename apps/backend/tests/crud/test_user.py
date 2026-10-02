"""User CRUD — email identity (IdP-agnostic)."""
from __future__ import annotations

import pytest
from app.crud.user import user_crud
from app.db.schemas.schemas import TokenData


def _td(email: str, sub: str = "393246181909659787", **kw) -> TokenData:
    base = {
        "sub": sub,
        "email": email,
        "preferred_username": kw.get("username", email.split("@")[0]),
        "name": kw.get("name", "Test User"),
        "email_verified": True,
        "scope": "user:read",
        "roles": [],
    }
    return TokenData.model_validate(base)


@pytest.mark.asyncio
async def test_get_by_email_missing(db_session):
    found = await user_crud.get_by_email(db_session, "nobody@example.com")
    assert found is None


@pytest.mark.asyncio
async def test_get_or_create_by_email_idempotent(db_session):
    td = _td("alice@example.com", sub="111")
    user = await user_crud.get_or_create(db_session, obj_in=td)
    assert user.email == "alice@example.com"
    assert user.id is not None
    assert not hasattr(user, "keycloak_id") or getattr(user, "keycloak_id", None) is None

    # Same email, different IdP sub → same NetHub user
    td2 = _td("alice@example.com", sub="999999999999999999")
    again = await user_crud.get_or_create(db_session, obj_in=td2)
    assert again.id == user.id

    by_email = await user_crud.get_by_email(db_session, "alice@example.com")
    assert by_email is not None
    assert by_email.id == user.id


@pytest.mark.asyncio
async def test_get_or_create_normalizes_email(db_session):
    td = _td("Bob@Example.COM", sub="zitadel-long-int-1")
    user = await user_crud.get_or_create(db_session, obj_in=td)
    assert user.email == "bob@example.com"
    again = await user_crud.get_or_create(
        db_session, obj_in=_td("bob@example.com", sub="other")
    )
    assert again.id == user.id


@pytest.mark.asyncio
async def test_token_data_accepts_string_sub():
    td = TokenData.model_validate(
        {
            "sub": 393246181909659787,  # Zitadel-style int
            "email": "z@example.com",
            "email_verified": True,
            "scope": "openid email profile",
        }
    )
    assert td.sub == "393246181909659787"
    assert td.email == "z@example.com"
    assert td.username  # filled from email local-part
