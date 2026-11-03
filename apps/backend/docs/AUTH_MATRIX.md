# NetHubKe API — Authentication / Authorization Matrix

## 1. Trust boundaries

- **Upstream identity provider:** Zitadel is the current OIDC provider. NetHubKe validates upstream access-token signature, issuer, audience, expiry and required claims. The integration remains OIDC/IdP-agnostic.
- **NetHubKe:** canonical ecosystem identity, product/service entitlement decisions and product-token issuer.
- **Product resource APIs:** validate NetHubKe JWTs locally using `GET /api/v1/auth/jwks.json`; enforce product-owned business roles and permissions.
- **Browser applications:** call their own same-origin BFF. They must not call the NetHubKe API origin directly or receive bearer tokens.
- **Persistence:** PostgreSQL is authoritative. Redis is a disposable cache.

Product APIs must not perform per-request introspection against NetHubKe on hot paths.

## 2. Upstream OIDC validation

| Setting | Purpose |
|---|---|
| `OIDC_ISSUER` | Expected upstream token issuer |
| `OIDC_JWKS_URL` | Upstream JWKS URL; Zitadel default is issuer + `/oauth/v2/keys` |
| `AUDIENCE` | Expected audience on the upstream OIDC access token |
| `ALGORITHMS` | Signature algorithm allowlist; RS256 by default |
| `JWKS_CACHE_TTL` | Upstream JWKS cache TTL; validation hard-caps it at 300 seconds |

Legacy `KEYCLOAK_*` names remain compatibility aliases for OIDC configuration. They do not mean Keycloak is the current identity provider.

The validator requires `exp`, `iat` and `sub`. Missing/invalid credentials, issuer, audience, signature or required claims fail with 401. A valid upstream identity is not automatically an active or entitled NetHubKe account.

## 3. Shared product-token configuration

All registered products use one product-token integration:

| Setting | Behavior |
|---|---|
| `PRODUCT_TOKEN_EXCHANGE_ENABLED` | Global exchange gate; defaults to `false` and applies to every product |
| `PRODUCT_TOKEN_ISSUER` | Shared `iss` claim for all product JWTs |
| `PRODUCT_TOKEN_TTL_SEC` | Shared token lifetime, hard-capped at 240 seconds |
| `PRODUCT_TOKEN_PRIVATE_KEY` | Optional shared PEM fallback for local/emergency use |
| `PRODUCT_TOKEN_ALLOW_ENV_PEM` | Explicit opt-in for that shared fallback; defaults to `false` |
| `SIGNING_KEY_ENCRYPTION_KEY` | Encrypts PostgreSQL-managed private keys at rest |
| `SIGNING_KEY_MAX_AGE_HOURS` | Shared signing-key rotation age |
| `SIGNING_KEY_RETIRE_OVERLAP_HOURS` | Shared overlap before retiring old public keys |

There are **no Tawala-specific environment settings**. The product registry is the sole source of each product's audience and registered claim profile. Product audience uniqueness is enforced in PostgreSQL. A product slug selects its registry row; it does not select a separate signing integration.

The global exchange gate is not a per-product switch. When false, exchange requests fail closed with 503 and signing-key bootstrap/automatic rotation is skipped. The JWKS endpoint remains public and may serve already-persisted active/retiring public keys; a JWKS read must not create signing state while exchange is disabled.

Private PEM environment fallback is opt-in and shared. Production should use PostgreSQL-managed keys encrypted with the stable `SIGNING_KEY_ENCRYPTION_KEY`; keep that key outside the database and back it up independently.

## 4. Route matrix

| Method | Path | Authentication | Purpose / notes |
|---|---|---|---|
| GET | `/health` | None | Liveness |
| GET | `/ready` | None | PostgreSQL/schema readiness |
| GET | `/api/v1/services/get-services` | None | Public service catalogue; not an entitlement grant |
| POST | `/api/v1/users/sync` | Valid upstream OIDC bearer | JIT identity initialization using canonical issuer + immutable subject |
| GET | `/api/v1/users/me` | Bearer + active local user | Own profile; `user:read` |
| PATCH | `/api/v1/users/me` | Bearer + active local user | Own profile; `user:write` |
| GET | `/api/v1/users/me/product-links` | Bearer + active local user | Read product organization links for caller's tenant |
| PUT | `/api/v1/users/me/product-links` | Bearer + authorized owner/admin | Sensitive product organization-link mutation; audit required |
| GET | `/api/v1/auth/jwks.json` | None | Public product-token JWKS; public keys only |
| POST | `/api/v1/auth/exchange` | Valid upstream OIDC bearer | Generic product-token exchange; global gate; product slug only |
| POST | `/api/v1/auth/exchange/tawala` | Valid upstream OIDC bearer | Legacy compatibility alias; same global gate and policy path |
| GET | `/api/v1/billing/*` | Route-specific bearer/scope | Billing reads; inspect individual route policy before use |

The Tawala exchange alias is retained for compatibility; new clients should use the generic `POST /api/v1/auth/exchange` endpoint.

## 5. Exchange decision sequence

When the global exchange gate is enabled, NetHubKe must:

1. Validate upstream token provenance and derive the canonical issuer + subject.
2. Resolve the canonical local user; email is mutable profile data, never the identity key.
3. Reject deleted, disabled or unlinked users.
4. Resolve the requested active product from the PostgreSQL registry.
5. Read the product audience and registered claim profile from that row.
6. Evaluate the product's organization/individual entitlement policy against PostgreSQL-authoritative state.
7. Resolve only claims allowed by the registered profile.
8. Mint a short-lived RS256 JWT using the shared managed signing-key set.

Caller-supplied audience, subject, organization ID, roles, entitlement and privileged claims are never trusted. A product token must be rejected by every other product audience.

## 6. Token contract

Common claims:

- `iss`: shared NetHubKe product-token issuer.
- `sub`: canonical NetHubKe user identifier.
- `aud`: exact audience from the requested Product registry row.
- `iat`, `exp`: issue and expiry times.
- `jti`: unique token identifier.
- `product`: registered product slug.
- JOSE `kid` and `alg`: managed signing-key ID and fixed RS256 algorithm.

Optional/profile-specific claims are documented in [PRODUCT_CLAIM_PROFILES.md](PRODUCT_CLAIM_PROFILES.md). Product-specific business permissions remain product-owned.

## 7. Failure and rollout behavior

- Exchange disabled: 503; no identity/product lookup, signing-key bootstrap or token mint side effect.
- Missing/invalid upstream bearer: 401.
- Unknown product: 404.
- Disabled account/product or missing entitlement: 403.
- Product audience collision or unsupported claim profile: fail closed.
- PostgreSQL unavailable: startup/readiness fails. Redis unavailable: cache operations degrade without changing PostgreSQL authorization decisions.
- Product JWTs are hard-capped at 240 seconds. The five-minute stale-access objective still requires measured end-to-end verifier JWKS refresh, clock-skew and emergency key-invalidation behavior; issuer TTL alone does not prove it.

## 8. N1 acceptance evidence

- Generic exchange and JWKS route tests live in `apps/backend/tests/api/test_auth_exchange.py`; signing/JWKS helper tests live in `apps/backend/tests/unit/test_tawala_token.py` (legacy test filename).
- Backend CI executes `pytest tests/`; latest verified baseline on PR #168 was 227 passed at 76.83% coverage. The shared-configuration refactor requires fresh CI before acceptance.
- N1 issue #42/#43 checklists remain historical, unchecked records; see `docs/validation/N1_ACCEPTANCE_VALIDATION.md` for mapped evidence and the documentation correction.
