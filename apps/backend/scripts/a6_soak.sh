#!/usr/bin/env sh
# A6 staging soak — generic HTTP client (curl).
# Requires: BASE_URL, IDP_ACCESS_TOKEN
set -eu

BASE_URL="${BASE_URL:?set BASE_URL e.g. https://api.staging.example}"
IDP_ACCESS_TOKEN="${IDP_ACCESS_TOKEN:?set IDP_ACCESS_TOKEN from IdP}"

# trim trailing slash
BASE_URL="${BASE_URL%/}"

echo "== health =="
curl -sS -f "$BASE_URL/health" | tee /tmp/a6_health.json
echo
echo "== ready =="
curl -sS -f "$BASE_URL/ready" | tee /tmp/a6_ready.json
echo

echo "== sync =="
SYNC_CODE=$(curl -sS -o /tmp/a6_sync.json -w "%{http_code}" \
  -X POST "$BASE_URL/api/v1/users/sync" \
  -H "Authorization: Bearer ${IDP_ACCESS_TOKEN}" \
  -H "Content-Type: application/json")
echo "HTTP $SYNC_CODE"
cat /tmp/a6_sync.json
echo
test "$SYNC_CODE" = "200" || { echo "FAIL: sync expected 200"; exit 1; }

# refuse product token field
if grep -q '"access_token"' /tmp/a6_sync.json; then
  echo "FAIL: response must not contain access_token"
  exit 1
fi

echo "== me =="
ME_CODE=$(curl -sS -o /tmp/a6_me.json -w "%{http_code}" \
  "$BASE_URL/api/v1/users/me" \
  -H "Authorization: Bearer ${IDP_ACCESS_TOKEN}")
echo "HTTP $ME_CODE"
cat /tmp/a6_me.json
echo
test "$ME_CODE" = "200" || { echo "FAIL: me expected 200"; exit 1; }

echo "== idempotent second sync =="
SYNC2_CODE=$(curl -sS -o /tmp/a6_sync2.json -w "%{http_code}" \
  -X POST "$BASE_URL/api/v1/users/sync" \
  -H "Authorization: Bearer ${IDP_ACCESS_TOKEN}" \
  -H "Content-Type: application/json")
test "$SYNC2_CODE" = "200" || { echo "FAIL: second sync expected 200"; exit 1; }

python3 - <<'PY'
import json
s1 = json.load(open("/tmp/a6_sync.json"))
s2 = json.load(open("/tmp/a6_sync2.json"))
me = json.load(open("/tmp/a6_me.json"))
assert s1.get("id") and s1["id"] == s2["id"] == me["id"], (s1.get("id"), s2.get("id"), me.get("id"))
print("user_id_match_ok", s1["id"])
PY

echo "== unauthenticated must 401 =="
U1=$(curl -sS -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/v1/users/sync")
U2=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/api/v1/users/me")
test "$U1" = "401" && test "$U2" = "401" || { echo "FAIL: expected 401 got sync=$U1 me=$U2"; exit 1; }

echo
echo "A6_SOAK_PASS"
