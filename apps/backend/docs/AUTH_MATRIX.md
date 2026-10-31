# NetHubKe API — Authentication / Authorization Matrix

> This file describes current implementation plus the approved target boundary. See docs/SSO_ARCHITECTURE_CONTRACT.md. This documentation-only update does not assert that every target control is implemented or staging-verified.

## Trust boundary

- Zitadel is the OIDC identity provider. NetHubKe validates configured IdP tokens and resolves a canonical NetHubKe identity.
- NetHubKe is the ecosystem-facing token issuer. Product APIs should accept short-lived, audience-specific NetHubKe JWTs, verify signatures locally using NetHubKe JWKS, and enforce product-owned business permissions.
- Do not treat an IdP token as a product API credential by default. Any Path A direct IdP-bearer compatibility path requires an explicitly approved, narrowly scoped, time-bounded exception and must not become the ecosystem default.
- Product APIs do not call NetHubKe for per-request introspection on hot paths.

## Current API behavior (verify before claiming full target compliance)

Resource server validation is configured by issuer/audience and JWKS; compatibility paths may remain. Confirm exact issuer configuration in the environment before rollout.

### Audience and scopes

- Config / env: AUDIENCE (default nethub-backend)
- Access tokens must include this value in aud (string or list)

| Scope | Meaning |
|---|---|
| user:read | Read own profile (GET /users/me) |
| user:write | Update own profile (PATCH /users/me) |
| identity:link | Explicitly link a verified upstream identity to a local account; requires an admin/ops role |
| services:admin | Mutate services catalogue (seed / create) |

OIDC noise scopes (openid, profile, email, …) are not authorization grants.

### Route matrix

| Method | Path | Auth | Scopes | Notes |
|---|---|---|---|---|
| GET | /health | None | — | Liveness |
| GET | /api/v1/services/get-services | None | — | Public catalogue; public availability is separate from auth policy |
| POST | /api/v1/services/seed-services | Bearer JWT + active user | services:admin | Mutating |
| POST | /api/v1/services/create-service | Bearer JWT + active user | services:admin | Mutating |
| POST | /api/v1/users/sync | Bearer IdP JWT (current compatibility behavior) | — | JIT provision; must not silently reactivate disabled identities |
| GET | /api/v1/users/me | Bearer JWT + active local user | user:read | |
| PATCH | /api/v1/users/me | Bearer JWT + active local user | user:write | |

Admin router is not mounted in the inspected API router.

## Path A issue #135 — decision reconciliation

Retain reusable membership concepts: authorization-only data in NetHubKe, no per-product operational staff tables, generic membership rather than per-product membership tables, and external_user_id links to a product-owned domain primary key.

The original decision “forward IdP bearer once; no product JWT mint” conflicts with the approved ecosystem contract and is not the default target. Keep #135 open until scope is split or revised with an explicitly approved compatibility exception; do not silently close it.

| Method | Path | Original issue description | Approved target |
|---|---|---|---|
| GET | /api/v1/access/{product_slug} | IdP bearer → principal JSON | Membership/entitlement may feed NetHubKe token issuance; product APIs trust NetHubKe JWT locally |
| POST | /api/v1/auth/exchange | NetHubKe issues product JWT (existing code/flags require verification) | Canonical product-token issuance boundary, audience-specific and policy-driven |

## Explicit access decision

Evaluate separately: service exists/enabled and public availability; whether auth is required; canonical identity active/not blocked; organization/tenant entitlement; individual grant where required; centrally authorized admin grant/override. Global service disable and disabled/blocked identity are hard denials. Ordinary grants cannot bypass them. Products enforce their own business roles and permissions.

## JWT/JWKS requirements (target; evidence required)

- Validate signature/algorithm allowlist, exact issuer, intended audience, expiry, not-before if present, token type and required claims.
- Required claims: iss, stable canonical sub, aud, iat, exp, jti; JOSE header contains kid. Authorization claims must be server-derived.
- Managed signing keys and dual-publish rotation through JWKS; private signing material remains within NetHubKe and is not shipped to products/frontends.
- Maximum stale-access window is five minutes end-to-end. Token TTL, entitlement/cache TTL, refresh behavior, clock skew and JWKS caches must be designed together rather than added independently. Emergency compromised-key/global-disable handling requires an explicitly tested faster path.
- Public services can be available without requiring login; service availability and auth requirements are separate policy fields.

## Signing keys (existing N2 work; verify actual behavior)

- Signing key table and JWKS route exist in the repository.
- Redis is cache/coordination; PostgreSQL is durable source of truth.
- Do not treat issue closure alone as proof of key custody, rotation, invalidation or recovery acceptance.


## N2 managed signing-key acceptance (implementation branch)

- Signing-key bootstrap is exchange-flag gated; a disabled exchange request cannot create key rows. An empty JWKS response remains possible when no key exists and exchange is disabled.
- PostgreSQL is the durable source of key state. Bootstrap uses a transaction advisory lock and rechecks for an active row before creating a key.
- JWKS sanitization permits only public RSA RS256 fields, deduplicates `kid`, and excludes retiring keys whose `retire_after` has elapsed.
- Private PEM values can be stored as `enc:v1:` Fernet ciphertext with `SIGNING_KEY_ENCRYPTION_KEY`. Production fails closed when the key is absent/invalid or a legacy plaintext row is used for signing.
- Existing plaintext rows require the documented, backed-up rollout in [SIGNING_KEY_CUSTODY.md](SIGNING_KEY_CUSTODY.md) using `scripts/encrypt_signing_keys.py`. No deployment or exchange flag change is authorized by this PR.
- N2 PR #147 is merged to `dev`; merge is not evidence of live Zitadel staging readiness or the five-minute revocation bound.

## Consolidated N3–N5 implementation (#148)

- Generic exchange and Tawala compatibility alias exist; exchange remains feature-flagged default-off. Product audience/profile and canonical identity behavior require contract tests.
- Product/org policy must fail closed for inactive products/services, disabled users and missing explicit external organization links. PR #152 adds a durable `(issuer, subject) → user UUID` mapping and stops email-only account linking; existing email-owned accounts require an explicit linking path.
- Product JWTs include `jti`; required common claims and cross-product audience rejection must be tested.
- Rotation uses a PostgreSQL advisory lock; manual/automatic rotation emits durable `security_audit_events` records. Emergency revoke retires a compromised key immediately, creates a replacement if the active key is targeted, and invalidates Redis caches.
- Standard claim profile omits Tawala-only `org_id` and `principal`; Tawala retains its compatibility profile. Unsupported profiles fail closed.
- Redis helpers degrade to cache misses/no-op writes. Entitlement decisions now read PostgreSQL rather than trusting cached positive/negative decisions; Redis writes are advisory only. This avoids stale positive grants at the cost of a database query per exchange.
- The five-minute stale-access bound and live Zitadel staging readiness remain unproven until measured end-to-end evidence is recorded.


## Canonical identity lifecycle (N3)

- Authenticated API requests resolve the local account only by the exact validated (issuer, sub) mapping. Email is mutable profile/contact data and must never be used to authenticate or locate an account.
- POST /api/v1/users/sync creates a mapping for a new identity but never silently links an existing email-owned account. A verified upstream email change may update the mapped user's email only if no other live local account owns it; an unverified email change is ignored.
- Soft-deleted users are excluded from email lookup, identity lookup, sync, and authenticated profile access. Disabled users remain denied and are never reactivated by sync.
- POST /api/v1/ops/identities/link requires both the identity:link scope and an admin/ops role, plus a separately validated proof token with a verified email matching the target local account. The subject is hashed in the durable audit event.


### N3 transaction and race-safety follow-up

- First-login provisioning creates the personal tenant, local user, and (issuer, subject) mapping in one PostgreSQL transaction. Tenant helpers may flush to obtain generated IDs but must not commit independently.
- Concurrent first-login attempts are resolved by database uniqueness constraints. A losing transaction rolls back and re-reads the winning identity mapping; it must not leave duplicate or orphan tenant/user rows.
- The HTTP sync contract explicitly rejects email-only linking for an existing local account and must leave its user, tenant, and identity state unchanged.

## Product entitlement policy (N4)

Exchange evaluates Product.entitlement_policy against PostgreSQL grants:
- organization_only: current subscription for this product and tenant.
- individual_only: active membership for this product and user.
- organization_or_individual: either grant (default).
- organization_and_individual: both grants.

Subscriptions are scoped by subscriptions.product_id and must be active or
trialing within their current period. Legacy rows with a null product_id are
preserved but cannot authorize a product. ProductLink maps an external
organization ID; it is not an entitlement.

A matching inactive Service row is a hard deny. Inactive/deleted users and
products are denied before entitlement evaluation. Unknown policies fail closed.

Administrative override endpoints under /api/v1/ops/entitlements/overrides
require both the entitlements:override scope and an admin, super_admin, or ops
role. Overrides target one product and one tenant or tenant-linked user,
require a reason, expire within 90 days, and are durably audited. They satisfy
only their corresponding grant dimension and never bypass disabled accounts,
products, or services.

PostgreSQL is authoritative. Redis is not consulted to authorize token exchange.


## N5 signing-key freshness implementation (2026-10-31)

- Automatic rotation re-checks active-key age after acquiring the PostgreSQL transaction advisory lock; competing workers cannot rotate a key another worker has just replaced.
- Public JWKS responses are reconstructed from PostgreSQL. Redis is not read as a response source, preventing stale cache entries from re-publishing revoked/retired keys after invalidation failure.
- Product access tokens are hard-capped at 240 seconds, including when a larger legacy TTL setting is configured. Resource servers must apply no more than 60 seconds of clock leeway.
- Resource servers must refresh JWKS at least every 60 seconds and immediately on unknown `kid`.
- The five-minute end-to-end bound remains unproven until actual product resource-server verifiers are tested with cached JWKS and measured clock behavior.


## N5 validation checkpoint — 2026-10-31

- Latest validated head: `82745f4ec772f08f4735741d5ac5e624a0fc0c35` on `fix/n5-signing-key-freshness` / PR #157.
- Backend CI run #121 passed: **218 tests passed**, **74.99% coverage**, per-file coverage validation passed, and Alembic upgrade → downgrade → upgrade passed. Run: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41221031075.
- Docker/PostgreSQL/Redis readiness run #82 passed. Run: https://github.com/NetHub-Ltd/NetHubKe/actions/runs/41221031072.
- PostgreSQL tests exercise independent-session concurrent manual rotation, concurrent automatic rotation, and emergency revocation while Redis invalidation is unavailable. HTTP tests verify operator-role and mutation-scope denials.
- No schema migration was needed for N5. No deployment or production feature-flag changes were made; exchange remains default-off.
- **N5 end-to-end freshness acceptance remains open:** the actual product resource-server verifiers are not in this repository, so their cached-JWKS refresh and clock-skew behavior have not been measured. The 240-second issuer cap and documented 60-second verifier limits are implementation controls, not proof of deployed verifier compliance.
- PR #157 remains open and unmerged pending user review. Do not close issue #152 or claim N5 fully accepted until the end-to-end verifier evidence is supplied.
