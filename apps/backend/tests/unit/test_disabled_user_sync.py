"""Regression: syncing an IdP profile never silently reactivates a disabled user."""
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from app.crud.user import user_crud
from app.db.schemas.schemas import TokenData


@pytest.mark.asyncio
async def test_get_or_create_does_not_reactivate_disabled_user():
    db = AsyncMock()
    existing = MagicMock(
        email="disabled@example.com",
        full_name="Disabled User",
        username="disabled",
        is_active=False,
    )
    token = TokenData(
        sub="immutable-subject",
        email="disabled@example.com",
        username="disabled",
        full_name="Disabled User",
        email_verified=True,
        roles=["user"],
        scope="",
    )
    with patch.object(user_crud, "get_by_email", new_callable=AsyncMock, return_value=existing):
        result = await user_crud.get_or_create(db, token)

    assert result is existing
    assert result.is_active is False
    db.add.assert_not_called()
    db.commit.assert_not_awaited()
