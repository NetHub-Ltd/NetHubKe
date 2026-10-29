# Product claim profiles (N3)

NetHubKe validates the configured upstream IdP access token and issues a short-lived product token only after server-side identity and access-policy checks. Product APIs validate NetHubKe JWTs locally through `GET /api/v1/auth/jwks.json`; they must not accept upstream Zitadel tokens as product API credentials by default.

## Common product JWT contract

| Claim/header | Required | Meaning |
|---|---|---|
| `iss` | yes | NetHubKe token issuer |
| `sub` | yes | Stable NetHubKe canonical user identifier; currently the local user UUID. Upstream identity mapping by `(issuer, immutable sub)` remains a tracked gap and must not be replaced with email as a primary key. |
| `aud` | yes | Exact audience from the registered product configuration |
| `iat`, `exp` | yes | Issue and expiry times; keep access tokens short-lived and design freshness end-to-end |
| `jti` | yes | Unique token identifier |
| JOSE `kid` | yes | Managed signing-key identifier |
| JOSE `alg` | yes | Fixed allowlisted algorithm (currently RS256) |
| `product` | yes | Registered product slug |
| `org_id` | profile-specific | External product organization ID resolved from an explicit product link or approved legacy mapping |
| `principal` | Tawala profile | `owner` or `terminal`, derived from verified upstream claims; never caller-selected |
| `email` | optional | Profile/contact attribute, never the canonical identity key |

Tokens for one product must not be accepted by another product. Audience, issuer, algorithm, expiry, required claims and key id must all be verified by resource servers.

## Profile: `standard`

- Contains only the common claims (`iss, sub, aud, iat, exp, jti, product`) plus optional email.
- Does not inherit Tawala-specific `org_id` or `principal` claims.
- Organization context must be added only by a future explicitly defined product profile.

## Profile: `tawala`

- Audience: registered product audience; the legacy `TAWALA_JWT_AUDIENCE` setting is server-side configuration.
- `org_id`: active `product_links.external_org_id`, then the explicitly configured legacy `tenant.tawala_organization_id`. There is no implicit fallback to `tenant.id`.
- `principal`: `owner` or `terminal`, derived by NetHubKe from verified upstream roles. Client-supplied hints can only match the derived value.
- Exchange endpoints: `POST /api/v1/auth/exchange` with `{"product":"tawala"}`; compatibility alias `POST /api/v1/auth/exchange/tawala`.
- Requires a verified upstream Bearer token, an active local user, tenant association, active product and entitlement decision.

## Adding another product

1. Register its stable slug, exact audience, active state and claim profile in the PostgreSQL `products` registry.
2. Document its required claims here and add positive/negative contract tests.
3. Resolve any external organization identifier through a product-specific link; never assume the NetHub tenant UUID is valid in another product.
4. Keep exchange disabled until the rollout and staging acceptance gate is met.

## Entitlement and organization policy

- PostgreSQL is authoritative; Redis is disposable cache.
- A globally inactive product/service and a disabled identity are hard denials.
- When subscription enforcement is required, missing service/subscription data fails closed.
- Product/org links are authorization-sensitive; only centrally authorized owners/admins may manage them.
- A five-minute stale-access bound is an end-to-end requirement, not a claim implied by the 120-second cache TTL.
