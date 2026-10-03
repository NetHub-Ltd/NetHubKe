"""Access token without email → UserInfo enrichment."""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from fastapi import HTTPException

from app.core import security


def test_fetch_userinfo_ok():
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "email": "a@example.com",
        "email_verified": True,
        "name": "A",
        "preferred_username": "a",
    }
    mock_client = MagicMock()
    mock_client.__enter__.return_value = mock_client
    mock_client.get.return_value = mock_resp

    with patch("app.core.security.httpx.Client", return_value=mock_client):
        data = security._fetch_userinfo("tok", "https://auth.example.com")
    assert data["email"] == "a@example.com"
    mock_client.get.assert_called_once()
    args, kwargs = mock_client.get.call_args
    assert args[0] == "https://auth.example.com/oidc/v1/userinfo"
    assert kwargs["headers"]["Authorization"] == "Bearer tok"


def test_fetch_userinfo_rejects_non_200():
    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.text = "nope"
    mock_client = MagicMock()
    mock_client.__enter__.return_value = mock_client
    mock_client.get.return_value = mock_resp

    with patch("app.core.security.httpx.Client", return_value=mock_client):
        with pytest.raises(HTTPException) as ei:
            security._fetch_userinfo("tok", "https://auth.example.com")
    assert ei.value.status_code == 401
