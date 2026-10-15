# NetHubKe API — Authentication / Authorization Matrix

Resource server: validates Keycloak JWTs (RS256, JWKS, `iss`, `aud`, `exp`).
Business data lives in Postgres; Keycloak does not store app profile data.

## Audience

- Config / env: `AUDIENCE` (default `nethub-backend`)
- Access tokens must include this value in `aud` (string or list)

## Scopes (Keycloak client scopes / token `scope` claim)

| Scope | Meaning |
|-------|---------|
| `user:read` | Read own profile (`GET /users/me`) |
| `user:write` | Update own profile (`PATCH /users/me`) |
| `services:admin` | Mutate services catalogue (seed / create) |

OIDC noise scopes (`openid`, `profile`, `email`, …) are ignored for authorization.

## Route matrix

| Method | Path | Auth | Scopes | Notes |
|--------|------|------|--------|-------|
| GET | `/health` | None | — | Liveness |
| GET | `/api/v1/services/get-services` | None | — | Public marketing catalogue |
| POST | `/api/v1/services/seed-services` | Bearer JWT + active user | `services:admin` | Mutating |
| POST | `/api/v1/services/create-service` | Bearer JWT + active user | `services:admin` | Mutating |
| POST | `/api/v1/users/sync` | Bearer JWT (valid signature only) | — | JIT provision; no DB user required yet |
| GET | `/api/v1/users/me` | Bearer JWT + active local user | `user:read` | |
| PATCH | `/api/v1/users/me` | Bearer JWT + active local user | `user:write` | |

Admin router is not mounted.

## Dependencies

| Dependency | Behavior |
|------------|----------|
| `get_token_data` | JWT only (sync) |
| `get_current_user` | JWT + local user exists + `is_active` |
| `require_scopes([...])` | `get_current_user` + scope subset check |

## Negative cases (must fail)

- Missing `Authorization` → 401
- Expired / bad signature / wrong `iss` / wrong `aud` → 401
- Valid token, user not provisioned (non-sync routes) → 404
- Valid token, `is_active=false` → 403
- Valid token, missing required scope → 403

## Path A product access (service-agnostic)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/v1/access/{product_slug}` | Bearer IdP JWT (`get_token_data`) | Principal JSON; no product JWT mint |

**Response:** `user_id`, `sub`, `email`, `tenant_id`, `product`, `entitled`, `role`, `external_org_id`, `external_user_id`.

**Data:** `memberships` — unique `(user_id, tenant_id, product_id)`; `role` interpreted by product; `external_user_id` = product domain PK (e.g. Tawala `PlatformUser.id` / `Staff.id`).

**Products (rows, not tables):** `tawala`, `tawala-platform`, …

**Fail closed:** unknown product 404; inactive user / no membership / not entitled 403; missing profile 404 (sync first).

Apps forward the IdP token once (session establish); they do not decode IdP JWTs.

## Tawala hard-session exchange (M2 — optional / not required for Path A)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/v1/auth/jwks.json` | None | Public JWKS for product JWT verify if used |
| POST | `/api/v1/auth/exchange/tawala` | Keycloak Bearer | Mints `aud=tawala-api` RS256 token |

**Flags (default off):** `TAWALA_EXCHANGE_ENABLED`, requires `TAWALA_JWT_PRIVATE_KEY` (PEM).

**Claims issued:** `sub` (Keycloak id), `org_id` (`tenant.tawala_organization_id` or `tenant.id`), `principal` (`owner`\|`terminal`), `iss`, `aud`, `exp`, `iat`, optional `email`.

No cashier rows are created in NetHub; Path A uses membership.`external_user_id` instead.

## Signing keys (N2)

- Table `signing_keys`: active | retiring | retired
- JWKS from DB (active+retiring), cached in Redis `nethub:as:jwks`
- First enable of exchange can bootstrap an RSA key into Postgres (or import env PEM once)
- Private keys never leave NetHubKe
