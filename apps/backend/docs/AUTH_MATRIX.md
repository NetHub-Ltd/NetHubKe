# NetHubKe API — Authentication / Authorization Matrix

## Trust boundary and status

- IdP: Zitadel (OIDC). NetHubKe validates upstream bearer tokens against configured issuer, audience and JWKS.
- Approved target: NetHubKe is the ecosystem-facing product token issuer. Product APIs validate short-lived, audience-specific NetHubKe JWTs locally via NetHubKe JWKS and enforce product-owned business permissions.
- Important current-state distinction: the approved target is not yet fully delivered. Path A currently accepts an upstream IdP bearer and returns principal JSON; this conflicts with the ecosystem target and must not be generalized to new product APIs. See #135 and #142/#143.
- Product APIs must not call NetHubKe for per-request introspection on hot paths.

## Upstream JWT validation

The resource-server validator checks configured issuer, audience, signature and expiry, and now explicitly requires exp, iat, and sub. The algorithm allowlist is configured by ALGORITHMS (default RS256). Missing or invalid credentials return 401. Tokens lacking email may trigger the configured OIDC UserInfo request.

Configuration:
- OIDC_ISSUER / legacy KEYCLOAK_ISSUER_URL
- OIDC_JWKS_URL / legacy KEYCLOAK_JWKS; Zitadel default is issuer + /oauth/v2/keys
- AUDIENCE (default nethub-api; CI overrides to nethub-backend)

## Scopes

| Scope | Meaning |
|---|---|
| user:read | Read own profile (GET /users/me) |
| user:write | Update own profile (PATCH /users/me) |
| services:admin | Mutate service catalogue (seed/create) |

OIDC noise scopes (openid, profile, email, …) are not authorization grants.

## Route matrix

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | /health | None | Liveness |
| GET | /api/v1/services/get-services | None | Public catalogue; availability is separate from auth policy |
| POST | /api/v1/users/sync | Bearer IdP JWT | JIT provision; disabled identities must not be silently reactivated |
| GET | /api/v1/users/me | Bearer JWT + active local user | Requires user:read |
| PATCH | /api/v1/users/me | Bearer JWT + active local user | Requires user:write |
| GET | /api/v1/auth/jwks.json | None | Public product-token JWKS (public keys only) |
| POST | /api/v1/auth/exchange | Bearer IdP JWT | Generic product exchange; default-off flag; active user/tenant and entitlement checks |
| POST | /api/v1/auth/exchange/tawala | Bearer IdP JWT | Backward-compatible Tawala alias; same default-off flag |

Admin router is not mounted in the inspected router.

## Exchange security requirements

- TAWALA_EXCHANGE_ENABLED defaults to false; disabled exchange returns 503 before product/user lookup, signing-key access or mutation.
- Principal is derived from verified upstream roles (owner/org_owner/tenant_owner/admin/super_admin → owner, otherwise terminal). Legacy principal request hints are accepted only if they match this derived value; clients cannot elevate themselves by sending principal=owner.
- Exchange currently resolves the local user by email for compatibility. This is not the final identity contract: canonical mapping by (issuer, immutable sub) and controlled account linking must be delivered separately; email alone must not be treated as a stable identity key.
- Product token claims currently include sub, org_id, principal, product, iss, aud, iat, exp, optional email, and JOSE kid. The approved future contract additionally requires jti and a bounded short TTL; these remain follow-up work.
- Product audience is server-selected from registered product configuration (Tawala may use its explicit audience setting). Callers cannot select an arbitrary audience.
- Product-token signing uses RS256 and managed signing-key rows. Public JWKS must never expose private PEM or private RSA parameters.

## Path A — issue #135

GET /api/v1/access/{product_slug} currently accepts a bearer IdP JWT and returns principal JSON, without minting a product JWT. Generic membership and external_user_id links to product-owned domain primary keys remain reusable design concepts, but direct IdP-bearer forwarding is not the approved ecosystem default. Preserve #135 history; any compatibility exception needs a named consumer, feature flag, expiry/removal date and separate acceptance criteria.

## Revocation target (not yet proven)

Maximum stale-access window is five minutes end-to-end across product-token TTL, refresh, entitlement/policy caches, JWKS caching, clock skew and propagation. Current settings include an eight-hour product-token default and a 120-second entitlement cache, so the approved five-minute bound is not yet satisfied by configuration. Resolve in the ordered programme, including token refresh and emergency key-disable behavior, before rollout.
