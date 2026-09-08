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
