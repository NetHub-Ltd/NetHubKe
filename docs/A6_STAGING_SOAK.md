# A6 — Staging soak (Architecture A)

**Goal:** Prove the resource-server contract with a **real IdP access token**, using the **same** HTTP mechanism every client (website, Tawala, NetPay) will use.

**Issue:** track evidence on the A6 GitHub issue.

---

## Prerequisites

1. NetHubKe backend reachable (staging URL or local with real OIDC config).
2. Postgres migrated (`alembic upgrade head` / image entrypoint).
3. Env validated via **pydantic_settings**:

| Variable | Purpose |
|----------|---------|
| `OIDC_ISSUER` | IdP issuer (exact `iss` in tokens) |
| `OIDC_JWKS_URL` | JWKS URL (or discoverable default) |
| `AUDIENCE` | Expected `aud` on access tokens (e.g. `nethub-api`) |
| `FASTAPI_DB_*` | Discrete DB credentials |

4. Ability to obtain an **access token** from the IdP for a test user (device flow, client credentials is **not** enough if user identity is required; prefer authorization code / device / password grant as your IdP allows for a human test account).

---

## Shared client contract (what we prove)

```text
Authorization: Bearer <IdP access token>
POST /api/v1/users/sync   → 200 User JSON (no NetHubKe-minted token)
GET  /api/v1/users/me     → 200 same user
```

No client-specific paths. No product-token exchange.

---

## Procedure

### 1. Health

```bash
curl -sS "$BASE_URL/health"
curl -sS "$BASE_URL/ready"
```

Expect `healthy` / `ready`.

### 2. Obtain IdP access token

Example (Zitadel / generic OIDC) — use your real client and scopes so the access token includes `sub`, and ideally `email`:

```bash
# Store only in shell env; never commit tokens
export IDP_ACCESS_TOKEN='...'
```

Confirm JWT claims (header/payload only; do not paste full token into tickets):

```bash
python - <<'PY'
import os, json, base64
tok = os.environ["IDP_ACCESS_TOKEN"]
payload = tok.split(".")[1] + "=="
print(json.dumps(json.loads(base64.urlsafe_b64decode(payload)), indent=2))
PY
```

Required for soak: `iss` matches `OIDC_ISSUER`, `aud` includes `AUDIENCE`, `sub` present, `exp` valid. Email strongly recommended for first-time sync.

### 3. Sync + me (generic HTTP client)

```bash
export BASE_URL='https://api.staging.example'   # or http://localhost:8000
./scripts/a6_soak.sh
```

Or manually:

```bash
curl -sS -X POST "$BASE_URL/api/v1/users/sync" \
  -H "Authorization: Bearer $IDP_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

curl -sS "$BASE_URL/api/v1/users/me" \
  -H "Authorization: Bearer $IDP_ACCESS_TOKEN"
```

**Pass criteria**

| Check | Expected |
|-------|----------|
| Sync status | 200 |
| Sync body | `id`, `email`, `is_active`; **no** `access_token` |
| Me status | 200 |
| Me `id` | Same as sync |
| Second sync | Same `id` (idempotent) |
| No auth | 401 on sync and me |

### 4. Config-switch smoke (IdP-agnostic)

On a **non-prod** instance only:

1. Point `OIDC_ISSUER` / `OIDC_JWKS_URL` / `AUDIENCE` at another OIDC issuer (or a second Zitadel project).
2. Restart process/pod (no code change).
3. Confirm process starts (`/health` 200).
4. Token from the **old** issuer must fail validation (401); token from the **new** issuer can sync if audience matches.

Record “boots with config-only IdP change” as evidence (yes/no + timestamp).

---

## Evidence template (paste on issue, redact secrets)

```text
Date:
Environment: (staging URL / local)
IdP issuer: (hostname only)
Audience:

/health: 
/ready:

sync status:
me status:
user id match (sync vs me): yes/no
idempotent second sync: yes/no
401 without token: yes/no
config-switch boot smoke: yes/no / N/A

Operator:
```

---

## Explicitly out of scope for A6

- Production DNS / Flux promotion
- Minting product tokens
- Frontend login UI
- Billing / entitlements
