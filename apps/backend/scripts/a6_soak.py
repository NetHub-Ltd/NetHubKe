#!/usr/bin/env python3
"""A6 soak: generic HTTP client against a live NetHubKe resource server."""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request


def req(method: str, url: str, token: str | None = None) -> tuple[int, dict | str]:
    headers = {"Accept": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if method == "POST":
        headers["Content-Type"] = "application/json"
        data = b"{}"
    else:
        data = None
    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            body = response.read().decode()
            try:
                return response.status, json.loads(body)
            except json.JSONDecodeError:
                return response.status, body
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return e.code, json.loads(body)
        except json.JSONDecodeError:
            return e.code, body


def main() -> int:
    base = os.environ.get("BASE_URL", "").rstrip("/")
    token = os.environ.get("IDP_ACCESS_TOKEN", "")
    if not base or not token:
        print("Set BASE_URL and IDP_ACCESS_TOKEN", file=sys.stderr)
        return 2

    code, health = req("GET", f"{base}/health")
    print("health", code, health)
    if code != 200:
        return 1

    code, ready = req("GET", f"{base}/ready")
    print("ready", code, ready)
    if code != 200:
        return 1

    code, sync = req("POST", f"{base}/api/v1/users/sync", token)
    print("sync", code, sync)
    if code != 200 or not isinstance(sync, dict):
        return 1
    if "access_token" in sync:
        print("FAIL: access_token present", file=sys.stderr)
        return 1

    code, me = req("GET", f"{base}/api/v1/users/me", token)
    print("me", code, me)
    if code != 200 or not isinstance(me, dict):
        return 1
    if sync.get("id") != me.get("id"):
        print("FAIL: id mismatch", file=sys.stderr)
        return 1

    code, sync2 = req("POST", f"{base}/api/v1/users/sync", token)
    if code != 200 or not isinstance(sync2, dict) or sync2.get("id") != sync.get("id"):
        print("FAIL: idempotent sync", file=sys.stderr)
        return 1

    code, _ = req("POST", f"{base}/api/v1/users/sync", None)
    if code != 401:
        print("FAIL: expected 401 without token on sync", code, file=sys.stderr)
        return 1
    code, _ = req("GET", f"{base}/api/v1/users/me", None)
    if code != 401:
        print("FAIL: expected 401 without token on me", code, file=sys.stderr)
        return 1

    print("A6_SOAK_PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
