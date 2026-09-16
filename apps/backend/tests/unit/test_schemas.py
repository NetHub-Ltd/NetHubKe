"""Pydantic schema tests."""
from uuid import uuid4

from app.db.schemas.schemas import TokenData, UserCreate, UserUpdate


def test_token_data_scopes_filter_oidc_noise():
    td = TokenData.model_validate(
        {
            "sub": str(uuid4()),
            "email": "x@example.com",
            "preferred_username": "x",
            "name": "X",
            "email_verified": True,
            "scope": "openid profile email user:read offline_access",
            "roles": [],
        }
    )
    assert "user:read" in td.scopes
    assert "openid" not in td.scopes


def test_user_create():
    u = UserCreate(username="u", email="u@example.com", full_name="U")
    assert u.username == "u"


def test_user_update():
    u = UserUpdate(full_name="New Name")
    assert u.full_name == "New Name"
