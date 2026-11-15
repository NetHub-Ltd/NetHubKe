"""Audit detail redaction."""
from __future__ import annotations

from app.crud.audit import _detail_json, _redact


def test_redact_bearer_and_secrets():
    assert "[REDACTED]" in _redact("Authorization: Bearer abc.def.ghi")
    assert "[REDACTED]" in _redact("password=hunter2")
    body = _detail_json({"token": "should-not-appear", "client": "spa"})
    assert "should-not-appear" not in body
    assert "spa" in body
