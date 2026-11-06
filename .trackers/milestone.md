> **Historical:** A0–A6 described the original Architecture A bare minimum. That foundation is implemented. For current integration contracts see `docs/INTEGRATIONS.md` and `docs/API.md`. Do not treat the checklist below as the only roadmap.

# NetHubKe Backend — Architecture A Milestones

**Contract:** Root `README.md` (Architecture A — resource server only).  
**Stack (locked):** FastAPI · SQLModel · PostgreSQL · `AsyncSession` for runtime DB · **sync** Alembic migrations · DB URL assembled in-process from discrete credentials (`FASTAPI_DB_USER`, `FASTAPI_DB_PASSWORD`, `FASTAPI_DB_HOST`, `FASTAPI_DB_PORT`, `FASTAPI_DB_NAME`) — not a single opaque `DATABASE_URL` as the primary config surface.  
**Quality bar:** Fully and thoroughly tested (pytest). No merge of a milestone without the tests listed for that milestone passing in CI (or reported under Not verified with reason).

**Anti-drift:** Any PR that introduces product-token minting, NetHubKe JWKS-as-AS, IdP-specific user columns, email-only identity without `(issuer, subject)`, or client-specific auth paths is **out of contract** and must be rejected.

---

## Milestone status

| ID | Name | State | Exit criteria (summary) |
|----|------|-------|-------------------------|
| **A0** | Contract & milestone lock | **PR1** | This file + stack/test bar on `dev` |
| **A1** | Backend skeleton | **PR1** | Layout, pydantic_settings, health/ready, CI workflow |
| **A2** | Identity data model | **PR2** | Tenant, User, UserIdentity + migrations + model tests |
| **A3** | IdP-agnostic token validation | **PR2** | JWT verify + deps; unit tests with fixed keys/claims |
| **A4** | User API | **PR3** | `POST /sync`, `GET/PATCH /me` + API tests |
| **A5** | Container image | **PR4** | Dockerfile/entrypoint; `build_and_push` can build |
| **A6** | Staging soak | **PR5 runbook** | Real IdP token → sync/me on staging |

**Later (not bare minimum — do not pull forward):** entitlements catalogue, billing, admin identity linking UI, frontend, product token exchange.

---

## A0 — Contract & milestone lock

**Goal:** Single written source of truth for Architecture A backend scope so agents and humans cannot reintroduce the AS/exchange drift.

**Includes**
- Root README Architecture A principles
- This milestone file
- Stack and test expectations below

**Exit**
- [ ] Merged to `dev`
- [ ] No application code required for A0

---

## A1 — Backend skeleton

**Goal:** Runnable FastAPI process with config and probes; no business routes yet beyond health.

**Layout (target)**
```text
apps/backend/
  Dockerfile
  entrypoint.sh
  requirements.txt
  requirements-dev.txt
  pytest.ini
  alembic.ini
  alembic/env.py          # sync engine for migrations
  app/
    main.py
    core/config.py        # assemble async/sync DB URLs from discrete creds
    core/security.py      # stub or minimal until A3
    db/session.py         # AsyncSession factory
    api/v1/api_router.py  # empty or health-only extras
  tests/
    conftest.py
    test_health.py
.github/workflows/backend-ci.yml
```

**Config rules**
- Primary: `FASTAPI_DB_USER`, `FASTAPI_DB_PASSWORD`, `FASTAPI_DB_HOST`, `FASTAPI_DB_PORT`, `FASTAPI_DB_NAME`
- Internally build:
  - async URL: `postgresql+asyncpg://...`
  - sync URL (Alembic): `postgresql+psycopg2://...` or `postgresql://...` per chosen sync driver
- OIDC: `OIDC_ISSUER`, `OIDC_JWKS_URL` (or discover), `AUDIENCE`, `ALLOWED_ORIGINS`
- All env via **pydantic_settings.BaseSettings** (fail on invalid/missing required)
- No vendor-required types in config module

**Tests (must pass)**
- `GET /health` → 200
- `GET /ready` → 200 when DB up; non-200 when DB down (if testable in CI)
- Settings load and assemble URLs without raising on valid fixture env

**Exit**
- [ ] Structure on `dev`
- [ ] backend-ci runs pytest on `apps/backend`
- [ ] Tests above green

---

## A2 — Identity data model

**Goal:** Durable identity plane owned by NetHubKe.

**Tables**
1. `tenants` — `id`, `name`, optional `email`, timestamps
2. `users` — `id` (local UUID PK), `email` (unique), `username`, `full_name`, `is_active`, `tenant_id` nullable FK
3. `user_identities` — `issuer`, `subject`, `user_id` FK; **UNIQUE(issuer, subject)**; **UNIQUE(user_id, issuer)**

**Rules**
- Canonical key is `(issuer, subject)`, not email
- No `keycloak_id` / IdP-specific columns
- Alembic **sync** migrations only; runtime remains AsyncSession

**Tests (must pass)**
- Migration upgrades/downgrades on empty Postgres (CI service)
- Unique constraint on `(issuer, subject)` enforced
- Unique constraint on `(user_id, issuer)` enforced
- SQLModel round-trip create/read via AsyncSession

**Exit**
- [ ] Models + migration(s) merged
- [ ] Tests green

---

## A3 — IdP-agnostic token validation

**Goal:** Resource-server validation of incoming Bearer access tokens.

**Behavior**
- Load JWKS from configured issuer (cache optional via Redis later; not required for A3)
- Verify signature, `iss`, `exp`, `aud`
- Normalize claims into internal `TokenData` (`sub` as str, email, name, roles optional)
- UserInfo fallback only when email missing and UserInfo URL configured
- `get_token_data` dependency: validate only, no DB
- Fail closed → 401

**Tests (must pass)**
- Valid token (test RSA key + claims) → `TokenData`
- Expired / wrong aud / wrong iss / bad signature → 401
- Missing Authorization header → 401
- `sub` remains string for large numeric subjects (Zitadel-style)

**Exit**
- [ ] `core/security.py` + deps wired
- [ ] Unit tests green (no live IdP required)

---

## A4 — User API

**Goal:** All clients share the same integration: Bearer IdP token → user JSON.

| Method | Path | Behavior |
|--------|------|----------|
| `POST` | `/api/v1/users/sync` | Validate → upsert by `(issuer,sub)` → `UserRead` |
| `GET` | `/api/v1/users/me` | Resolve user; 404 if never synced |
| `PATCH` | `/api/v1/users/me` | Update allowed profile fields only |

**Sync rules**
- New issuer+sub → create user + identity (idempotent on repeat)
- Existing issuer+sub → update profile fields as policy allows; do not reactivate disabled users silently
- Same email, different sub → **409** (no silent link)

**Tests (must pass)**
- Sync creates user + identity
- Second sync same token identity is idempotent (same user id)
- `GET /me` after sync returns profile
- `GET /me` without sync → 404
- Disabled user policy covered by test
- Email collision different sub → 409
- Unauthenticated → 401 on all three routes
- No response field that looks like a minted NetHubKe access token

**Exit**
- [ ] Routes + CRUD + tests green in CI

---

## A5 — Container image

**Goal:** Restore deployable backend image for GHCR workflow already on `dev`.

**Includes**
- `Dockerfile` (context `apps/backend`)
- `entrypoint.sh`
- Requirements installed in image
- App imports under `PYTHONPATH`

**Tests / verification**
- Local or CI `docker build` succeeds
- Container boots and `/health` responds (readiness may need linked Postgres in CI)

**Exit**
- [ ] `build_and_push.yml` context exists and build succeeds
- [ ] Documented image name remains `ghcr.io/nethub-ltd/nethubke`

---

## A6 — Staging soak

**Goal:** Prove Architecture A with a real IdP.

**Verification (manual + scripted where possible)**
- [ ] Configure staging OIDC_* to current IdP (e.g. Zitadel)
- [ ] Obtain access token via real login
- [ ] `POST /users/sync` and `GET /users/me` succeed with same token from a generic HTTP client (simulating website / Tawala / NetPay)
- [ ] Switch issuer config in a non-prod slot still boots (smoke) without code change

**Exit**
- [ ] Evidence recorded in PR or tracker (not anecdotal)

---

## Test strategy (all milestones)

| Layer | Tool | Notes |
|-------|------|-------|
| Unit | pytest + anyio/asyncio | security, config URL assembly, pure helpers |
| API | httpx `AsyncClient` + ASGI | routes, status codes, payloads |
| DB | Pytest + Postgres service in CI | real constraints, not SQLite |
| Migrations | Alembic upgrade/downgrade in CI | sync engine |
| Forbidden | — | Mocks that skip JWT crypto for “happy path only” without separate negative cases |

**CI minimum (`backend-ci.yml`)**
- Postgres 16 service
- `pytest` with coverage artifact optional but encouraged
- Path filters on `apps/backend/**`

---

## Drift checklist (reviewers)

Reject or request changes if the PR:

1. Adds token **minting** / exchange / signing_keys for product APIs  
2. Adds IdP vendor-specific columns or required Keycloak-only code paths  
3. Uses email as the only identity key  
4. Introduces a second auth mechanism for one client  
5. Drops tests for a milestone without moving them to Not verified with cause  
6. Uses SQLite as primary store  

---

## Delivery plan

| PR group | Milestones | Notes |
|----------|------------|-------|
| Docs | A0 | This file |
| Scaffold | A1 | Skeleton + CI |
| Identity | A2–A4 | Prefer one PR if small; split only if review burden is high |
| Ship path | A5 | Image |
| Validate | A6 | Staging evidence |

All implementation PRs target **`dev`**. No direct pushes to `dev`/`main`.


## A6 materials

- `docs/A6_STAGING_SOAK.md`
- `apps/backend/scripts/a6_soak.sh`
- `apps/backend/scripts/a6_soak.py`
- Evidence on the A6 GitHub issue after a real IdP run
