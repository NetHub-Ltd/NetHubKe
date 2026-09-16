"""Authenticated user sync / me paths."""
from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_sync_and_me(
    client: AsyncClient, make_kc_token, patch_kc_decode
):
    token = make_kc_token(scopes="openid user:read user:write")
    headers = {"Authorization": f"Bearer {token}"}
    r = await client.post("/api/v1/users/sync", headers=headers)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body.get("email") or body.get("id")

    r2 = await client.get("/api/v1/users/me", headers=headers)
    assert r2.status_code == 200, r2.text

    r3 = await client.patch(
        "/api/v1/users/me", headers=headers, json={"full_name": "Updated Name"}
    )
    assert r3.status_code == 200, r3.text
