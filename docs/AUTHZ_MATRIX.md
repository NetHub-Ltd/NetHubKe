# Authorization matrix — NetHubKe routes

**Purpose:** Inventory every HTTP route and its protection class. Deny-by-default: anything not listed as public requires a valid Bearer token (and further checks as noted).

**Related:** [INTEGRATIONS.md](./INTEGRATIONS.md), [API.md](./API.md), [RESOURCE_SERVER_READINESS.md](./RESOURCE_SERVER_READINESS.md) §4, issue #229.

**Update rule:** Any PR that adds or changes a route must update this matrix in the same PR.

---

## Protection classes

| Class | Meaning |
|-------|---------|
| **public** | No authentication |
| **authenticated** | Valid IdP access token → local user (via `get_token_data` / `get_current_user`) |
| **owner** | Authenticated + object-level check (resource belongs to caller) |
| **admin** | Authenticated + `User.is_admin` (`get_current_admin`) |
| **operator** | Gated by environment / feature flag (not end-user auth) |

There is **no organization-scoped** class yet (membership model is future work; see readiness P1).

---

## Root probes and diagnostics

| Method | Path | Class | Dependency / policy | Notes |
|--------|------|-------|---------------------|-------|
| GET | `/health` | public | — | Liveness; no secrets |
| GET | `/ready` | public | DB `SELECT 1` | Readiness; avoid leaking internals in production responses |
| GET | `/diagnostics` | operator | `DIAGNOSTICS_ENABLED` or non-production | Returns 404 when disabled in production |

---

## API v1 — users

| Method | Path | Class | Dependency / policy | Notes |
|--------|------|-------|---------------------|-------|
| POST | `/api/v1/users/sync` | authenticated | `get_token_data` → sync by `(issuer, sub)` | Provisions user; may set admin via bootstrap emails |
| GET | `/api/v1/users/me` | authenticated | `get_token_data` → resolve user | 404 if never synced |
| PATCH | `/api/v1/users/me` | authenticated | `get_token_data` + `UserUpdate` | Only `full_name`, `username` writable |

---

## API v1 — services

| Method | Path | Class | Dependency / policy | Notes |
|--------|------|-------|---------------------|-------|
| GET | `/api/v1/services` | public | — | Active catalog only |

---

## API v1 — applications (user)

| Method | Path | Class | Dependency / policy | Notes |
|--------|------|-------|---------------------|-------|
| POST | `/api/v1/applications` | authenticated | `get_token_data` + sync | Creates application for caller |
| GET | `/api/v1/applications` | authenticated | `get_current_user` | Lists **caller’s** applications only |
| GET | `/api/v1/applications/{id}` | owner | `get_current_user` + `app.user_id == user.id` | Mismatch → **404** (no existence leak) |
| POST | `/api/v1/applications/{id}/messages` | owner | same ownership check | User message on own application |

---

## API v1 — admin

| Method | Path | Class | Dependency / policy | Notes |
|--------|------|-------|---------------------|-------|
| GET | `/api/v1/admin/applications` | admin | `get_current_admin` | All applications |
| GET | `/api/v1/admin/applications/{id}` | admin | `get_current_admin` | Detail + messages |
| POST | `/api/v1/admin/applications/{id}/messages` | admin | `get_current_admin` | Staff reply |
| PATCH | `/api/v1/admin/applications/{id}` | admin | `get_current_admin` | Status transition |
| GET | `/api/v1/admin/trusted-clients` | admin | `get_current_admin` | List clients |
| POST | `/api/v1/admin/trusted-clients` | admin | `get_current_admin` | Register client id |
| POST | `/api/v1/admin/trusted-clients/{client_id}/revoke` | admin | `get_current_admin` | Revoke client |

Admin is currently a **global boolean** (`User.is_admin`), not org-scoped.

---

## Token validation (all authenticated / owner / admin routes)

Before route handlers run, Bearer validation includes:

1. Signature + issuer + `exp` + `sub` (JWKS)
2. **Resource audience** (`aud` ∩ `RESOURCE_AUDIENCE`) — required in staging/production
3. **Trusted client** (`azp` / `client_id` ∈ active `trusted_clients`)

See [IDP_TOKEN_PROFILE.md](./IDP_TOKEN_PROFILE.md).

---

## Deny-by-default notes

- Unknown paths under the app return framework 404; they are not authenticated by accident.
- There is no “optional auth” mode that elevates privileges when a token is present.
- Scopes from the token are **not** yet used for route authorization (parsed only).
- Organization / tenant membership is **not** yet enforced (nullable `tenant_id` is not a tenancy boundary).
- User-supplied body fields never grant `is_admin` or ownership.

---

## Gaps tracked for later readiness work

| Gap | Tracked by |
|-----|------------|
| Organization-scoped authorization | Readiness P1 / issue #230 |
| Replace binary `is_admin` with scoped roles | issue #231 |
| Enforce scopes per route when product scopes exist | readiness follow-up |
| Sanitize `/ready` error detail in production | issue #237 |

---

## Drift check (optional)

When OpenAPI is generated from the running app, every path should appear in this matrix. Prefer updating the matrix in the same PR as the route change rather than relying on post-hoc discovery.
