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
