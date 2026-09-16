"""User CRUD real tests."""
from __future__ import annotations

import uuid

import pytest
from app.crud.user import user_crud
from app.db.schemas.schemas import TokenData


@pytest.mark.asyncio
async def test_get_by_sub_missing(db_session):
    found = await user_crud.get_by_sub(db_session, uuid.uuid4())
    assert found is None


@pytest.mark.asyncio
async def test_get_or_create_idempotent(db_session):
    sub = uuid.uuid4()
    td = TokenData.model_validate(
        {
            "sub": str(sub),
            "email": "alice@test.local",
            "preferred_username": "alice",
            "name": "Alice",
            "email_verified": True,
            "scope": "user:read",
            "roles": [],
        }
    )
    user = await user_crud.get_or_create(db_session, obj_in=td)
    assert user.email == "alice@test.local"
    assert user.keycloak_id == sub
    again = await user_crud.get_or_create(db_session, obj_in=td)
    assert again.id == user.id
    by_sub = await user_crud.get_by_sub(db_session, sub)
    assert by_sub is not None
