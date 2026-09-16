# Product claim profiles (N3)

NetHubKe mints product access tokens after a successful Keycloak session exchange.
Each **product** row has a `claim_profile` that documents expected JWT claims.

Issuer (`iss`) is always the NetHubKe AS issuer (`TAWALA_JWT_ISSUER` / settings).
Audience (`aud`) comes from the product registry (overridable for Tawala via `TAWALA_JWT_AUDIENCE`).

## Profile: `tawala` (first product)

| Claim | Required | Description |
|-------|----------|-------------|
| `sub` | yes | Keycloak subject (stable IdP user id), **not** NetHub internal UUID |
| `org_id` | yes | Tawala organization UUID: `tenant.tawala_organization_id` if set, else `tenant.id` |
| `principal` | yes | `owner` or `terminal` (POS shared session) |
| `aud` | yes | Default `tawala-api` (`TAWALA_JWT_AUDIENCE`) |
| `iss` | yes | NetHubKe AS issuer |
| `iat` / `exp` | yes | Issued / expiry (TTL `TAWALA_JWT_TTL_SEC`, default 8h) |
| `email` | optional | User email when available |
| `product` | yes (N3+) | Product slug, e.g. `tawala` |

### Alignment notes

- Product apps (Tawala) must validate signature via NetHubKe **JWKS** (`GET /api/v1/auth/jwks.json`), not Keycloak JWKS.
- Do not put NetHub private signing keys in product frontends or repos.
- Exchange remains **off** until `TAWALA_EXCHANGE_ENABLED=true` and signing keys are available (N2).

### Endpoint

- Generic: `POST /api/v1/auth/exchange` body `{"product":"tawala"}`
- Alias: `POST /api/v1/auth/exchange/tawala`

Both require `Authorization: Bearer <Keycloak access token>` and a synced local user with tenant.

## Adding a product later

1. Insert `products` row (`slug`, `audience`, `claim_profile`, `is_active`).
2. Document a new profile section here (required claims).
3. N4+ may add `product_links` / entitlement checks before mint.
