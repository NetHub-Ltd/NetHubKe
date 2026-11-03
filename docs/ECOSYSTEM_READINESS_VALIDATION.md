# NetHubKe Ecosystem Readiness Validation

**Purpose:** Evidence-based validation of the minimum NetHubKe capabilities required to serve Tawala, NetPay and future products.
**Baseline:** `dev` at branch creation on 2026-11-01.
**Validation branch:** `validation/ecosystem-readiness`
**Scope:** Inspect implementation, security boundaries, tests, migrations, configuration and CI evidence. No implementation changes, deployments, feature-flag changes or issue closures in this validation pass.

## Validation rules

- Judge only requirements necessary for the approved architecture contract.
- A requirement passes only when implementation and meaningful evidence support it; documentation or issue closure alone is insufficient.
- Mark unsupported claims **unverified**, not passed.
- Distinguish repository evidence from staging/runtime evidence.
- Nice-to-haves, UI polish, SDKs and speculative future features are not failures unless necessary to make the minimum integration contract safe and usable.
- Record exact file paths, relevant functions/routes, test names, CI run links and gaps.
- Keep all eight validation issues open until findings are reviewed with the user.

## Overall status

| Issue | Area | Status | Initial observation |
|---|---|---|---|
| #158 | Zitadel authentication boundary | Not yet validated | Inspect actual OIDC flow and token validation. |
| #159 | Canonical identity and lifecycle | Partially evidenced | AUTH_MATRIX describes issuer+subject mapping and lifecycle controls; verify code and tests. |
| #160 | Product registration and isolation | Not yet validated | Verify product model, audience binding and disabled-product enforcement. |
| #161 | Product-specific token issuance | Partially evidenced | AUTH_MATRIX describes exchange and N4/N5 behavior; verify implementation and negative tests. |
| #162 | JWKS and local verification contract | Partially evidenced | N5 merged; issuer-side behavior has CI evidence. Product verifier contract still needs precise validation. |
| #163 | Authorization and entitlements | Partially evidenced | N4 policy modes and PostgreSQL authority are documented; verify evaluator and tests. |
| #164 | Revocation, key rotation and freshness | **Known acceptance gap** | N5 CI passed, but the five-minute end-to-end stale-access bound is explicitly unproven without resource-server verifier evidence. |
| #165 | Product integration contract and operational prerequisites | Not yet validated | Compare routes, schemas, config, docs and startup/readiness behavior. |

## Confirmed programme context

- Architecture contract: `docs/SSO_ARCHITECTURE_CONTRACT.md`.
- Zitadel is the authentication provider; NetHubKe owns canonical identity, access policy and product-token issuance.
- Product APIs should verify NetHubKe JWTs locally using JWKS; no per-request introspection on hot paths.
- PostgreSQL is the durable source of truth; Redis is cache/coordination only.
- Product APIs retain their own business/resource permissions.
- Exchange remains default-off unless separately approved for rollout.
- PR #157 (N5) merged to `dev` as `17d38a3ca2ff1323c73577b30c591a28181bfd70`. Its reported CI passed on implementation head `801d925fec459fe8cc2c8095c2626d1415eb1fe9`; latest merge does not itself prove staging behavior.

## Findings

### #158 — Zitadel authentication boundary

**Status:** Not yet validated.

- Pending: trace OIDC discovery/configuration, authorization callback, state/nonce, token signature/issuer/audience/expiry validation and negative paths.
- Pending: confirm no local-password or alternate login path bypasses Zitadel.

### #159 — Canonical identity and lifecycle

**Status:** Partially evidenced; code-level validation pending.

- AUTH_MATRIX states canonical resolution uses exact validated `(issuer, sub)`, with email treated only as mutable profile data.
- AUTH_MATRIX states linking requires `identity:link`, admin/ops role and separately validated proof token; soft-deleted/disabled identities are excluded.
- Pending: verify models, database uniqueness, transactional provisioning, routes and corresponding tests on `dev`.

### #160 — Product registration and isolation

**Status:** Not yet validated.

- Pending: verify product identifiers, active-state enforcement, audience selection, product-specific organization mapping and caller inability to choose arbitrary product/audience.

### #161 — Product-specific token issuance

**Status:** Partially evidenced; code-level validation pending.

- AUTH_MATRIX states product tokens contain `jti`, use server-derived claims and supported claim profiles; exchange is default-off.
- N5 PR states product token lifetime is capped at 240 seconds.
- Pending: verify actual exchange route, claim construction, signing algorithm/type, audience binding, denial paths and tests.

### #162 — JWKS and local token verification contract

**Status:** Partially evidenced; verifier contract pending.

- N5 implementation rebuilds JWKS from PostgreSQL rather than trusting Redis response reads.
- N5 tests reportedly cover cache bypass and emergency revocation during Redis outage.
- Product verifier requirements documented as JWKS refresh <=60 seconds and clock leeway <=60 seconds.
- Pending: inspect actual JWKS route and public-key filtering; determine whether the documented verifier contract is sufficiently precise and testable. Do not infer product verifier compliance.

### #163 — Central authorization and entitlement decisions

**Status:** Partially evidenced; code-level validation pending.

- AUTH_MATRIX describes four explicit policy modes: `organization_only`, `individual_only`, `organization_or_individual`, `organization_and_individual`.
- It states inactive identity/product/service are hard denials; ProductLink is mapping, not entitlement; overrides are scoped, time-bounded and audited; PostgreSQL is authoritative.
- Pending: inspect evaluator, queries, authorization boundaries, audit persistence and decision-matrix tests.

### #164 — Revocation, signing-key rotation and access freshness

**Status:** **Known acceptance gap — end-to-end bound unproven.**

- N5 PR #157 merged to `dev`; reported CI: 218 tests, 74.93% coverage, per-file coverage and Alembic upgrade/downgrade/re-upgrade passed; Docker/PostgreSQL/Redis readiness passed.
- N5 issuer-side controls: token lifetime hard cap 240 seconds; JWKS is reconstructed from PostgreSQL; automatic rotation rechecks key age under advisory lock; emergency revocation and concurrency tests exist.
- Resource-server verifier cache refresh and clock behavior have not been measured against actual product verifiers. Therefore the five-minute end-to-end stale-access bound is **not proven**.
- Pending: inspect implementation/tests and identify the exact evidence needed for a valid end-to-end measurement.

### #165 — Product integration contract and operational prerequisites

**Status:** Not yet validated.

- Pending: inventory actual public exchange/JWKS endpoints, schemas, errors, required settings, issuer/audience/claims, flag behavior and startup dependencies.
- Pending: compare documented integration contract with mounted routes and runtime configuration.
- Pending: verify PostgreSQL is required at startup and Redis degradation is safe for the relevant flows.

## Change / evidence log

| Date | Area | Action / evidence | Result |
|---|---|---|---|
| 2026-11-01 | Programme | Read `AGENTS.md`, architecture contract, AUTH_MATRIX and trackers on `dev`. | Architecture boundaries and validation rules captured. |
| 2026-11-01 | Issues | Confirmed validation issues #158–#165 exist and are open. | No duplicate issues created. |
| 2026-11-01 | N5 | Checked PR #157 metadata and merge state. | Merged; end-to-end freshness remains unproven. |

## Final assessment

Not yet complete. The known blocker is the unproven five-minute end-to-end stale-access bound. All other areas remain subject to code-level inspection; partial documentation/CI evidence must not be promoted to a pass without verifying the underlying implementation and tests.


## Detailed implementation findings — 2026-11-01

### #158 — Zitadel authentication boundary

**Preliminary result: core API token validation present; full login/session boundary not yet proven.**

Evidence:
- `apps/frontend/src/auth.ts`: Auth.js is configured with an OIDC provider using the configured issuer/client. The authorization request asks for `openid profile email`. Auth.js owns the authorization-code callback; the app does not implement its own credential/password flow.
- `apps/frontend/src/lib/server/oidcConfig.ts`: issuer/client are read from OIDC env vars (legacy Keycloak aliases retained); discovery is fetched from `{issuer}/.well-known/openid-configuration` and cached in-process for one hour.
- `apps/backend/app/core/security.py::_decode_token`: validates JWT signature via configured JWKS, RS256/configured algorithm allowlist, issuer, audience, and required `exp`, `iat`, `sub`; 10-second leeway. If email is absent it calls the configured issuer's UserInfo endpoint.
- `apps/backend/tests/unit/test_security.py`: tests valid, expired, wrong audience, wrong issuer, invalid signature, wrong algorithm and missing required claims.
- `apps/backend/tests/api/test_auth_exchange.py`: exchange requires bearer; missing bearer returns 401; disabled exchange returns 503 before DB/key side effects.

Open checks:
- Verify Auth.js state/nonce/PKCE behavior from dependency/config and tests; no repository-owned callback validation code is present (expected if delegated to Auth.js).
- Verify refresh token rotation/error behavior and that disabled/unmapped users cannot gain protected console capabilities when backend sync fails. `auth.ts` intentionally retains an IdP-only session when `/users/sync` fails; product exchange still has its own backend denial.
- No live Zitadel staging flow evidence was inspected in this pass.

### #159 — Canonical identity and lifecycle

**Preliminary result: strong repository evidence; test evidence exists.**

Evidence:
- `apps/backend/app/db/models/models.py::UserIdentity`: unique constraints on `(issuer, subject)` and `(user_id, issuer)`.
- `apps/backend/app/crud/user.py::get_by_upstream_identity`: exact issuer+subject lookup; normalizes issuer trailing slash but preserves opaque subject.
- `UserCRUD.get_or_create`: requires issuer+subject, resolves mapped identity first, denies inactive users, updates email only when upstream marks it verified and no other live user owns it, refuses email-only linking, and creates tenant/user/identity in one transaction.
- `apps/backend/app/api/v1/routes/ops_keys.py::ops_link_upstream_identity`: requires identity:link scope plus admin/ops role; independently validates proof token, exact trusted issuer, subject and verified email; rejects conflicting links; records durable audit with subject hash.
- Tests in `apps/backend/tests/api/test_identity_lifecycle.py`: email change, verified-email collision, soft-deleted identity denial, disabled-user non-reactivation, unverified email change, email-only link rejection, concurrent first sync.
- Prior N3 CI evidence in tracker: 187 tests passed, 74.19% coverage; readiness passed. This is historical CI for the N3 implementation, not a new run during this audit.

Potential boundary to reconcile:
- The mounted legacy `GET /api/v1/access/{product_slug}` path in #165 still resolves a user using `get_by_email`, not issuer+subject. It is a direct-IdP-token principal endpoint and is not gated by the exchange flag. This is inconsistent with the approved target architecture and must not be treated as the default product integration path.

### #160 — Product registration and isolation

**Preliminary result: registry exists and active state is checked; audience uniqueness is not enforced.**

Evidence:
- `apps/backend/app/db/models/models.py::Product`: stable unique slug, audience, active flag, claim profile and entitlement policy.
- `apps/backend/alembic/versions/e8f9a0b1c2d3_add_products.py`: unique index on slug; no unique constraint/index on audience.
- `apps/backend/app/services/tawala_token.py::get_product_by_slug`: rejects unknown, soft-deleted and inactive products.
- `apps/backend/app/api/v1/routes/auth.py::_run_exchange`: product is selected server-side by registered slug; audience is loaded from the product row (Tawala has a compatibility settings override); user cannot submit audience.
- `apps/backend/tests/api/test_auth_exchange.py`: covers active-product exchange success, unknown product, inactive user and entitlement denial.

Finding:
- **Audience is not unique across products.** The model and migration permit two active products to share the same JWT audience. Since audience is the primary resource-server isolation boundary in the approved contract, duplicate audiences can make one product's token acceptable to another verifier if that verifier validates only issuer/audience. The additional `product` claim does not repair this unless every product verifier is contractually required to check it. Treat as a real isolation gap, not a feature request.
- No product administration/registration API is mounted; product registration currently depends on seeded/database-managed records. Determine whether that is sufficient for the initial ecosystem, rather than demanding a UI.

### #161 — Product-specific token issuance

**Preliminary result: issuer path is implemented; contract gaps remain under review.**

Evidence:
- `apps/backend/app/api/v1/routes/auth.py::_run_exchange`: checks feature flag first; resolves the canonical user by issuer+subject; denies missing/disabled user and missing tenant; checks product entitlement; derives audience from product record; resolves Tawala organization mapping; selects server-defined claim profile.
- `apps/backend/app/services/tawala_token.py::mint_product_access_token`: signs RS256 JWT with managed active key and `kid`; sets `iss`, `sub`, `aud`, `iat`, `exp`, `jti`, `product`; caps lifetime at 240 seconds; Tawala profile requires server-resolved `org_id` and principal.
- `apps/backend/tests/api/test_auth_exchange.py`: covers disabled exchange (including no DB/key side effects), missing bearer, invalid request, principal elevation, inactive user, missing tenant, denied entitlement and unknown product.
- `apps/backend/tests/unit/test_tawala_token.py::test_mint_product_success_token_claims_and_signature`: verifies RS256 signature, kid, issuer, audience, canonical subject, product claim, iat/exp/jti and no private key/password/tenant_id leakage.

Open checks:
- Product audience uniqueness from #160 is a token-isolation dependency.
- JWT header currently explicitly supplies `kid`; inspect actual encoded header and target token-type requirement. The approved contract requires resource servers to enforce token type, but no resource-server verifier implementation is in this repo.
- Verify `nbf` handling requirement is correctly understood: issuer need not add it unless the contract explicitly requires it; verifiers must validate it when present.

### #162 — JWKS and local verification

**Preliminary result: issuer-side JWKS controls present; verifier-side acceptance not demonstrated.**

Evidence:
- `build_jwks_document` selects active/retiring non-deleted keys from PostgreSQL; expired retiring keys are omitted; sanitizer permits only RSA/RS256 public fields and unique non-empty kid; Redis is write-only best-effort cache.
- `apps/backend/tests/api/test_auth_exchange.py::test_jwks_endpoint_returns_public_jwks_shape` checks public JWKS shape and absence of private fields.
- `apps/backend/tests/unit/test_tawala_token.py` covers stale Redis cache bypass, database key source, public field filtering, duplicate kid removal, unsupported algorithm filtering and missing modulus.
- `docs/SIGNING_KEY_ROTATION.md` / `AUTH_MATRIX.md` document 60-second JWKS refresh and clock-leeway limits.

Open checks:
- No product verifier source or executable verifier contract tests are present in this repository. Issuer publication tests do not prove local verifier behavior for wrong issuer/audience/alg/type, unknown kid, expired token or key retirement.
- Confirm whether public JWKS should be empty while exchange is disabled and no key exists; this appears intentional and is not by itself a failure.

### #163 — Authorization and entitlement decisions

**Preliminary result: policy evaluator and decision matrix tests are present.**

Evidence:
- `apps/backend/app/services/entitlements.py::check_entitled`: checks product active/deleted, matching Service hard-disable, policy allowlist, product-scoped active subscription period, active product membership and product-scoped non-expired/non-revoked overrides; evaluates all four supported policy modes.
- `apps/backend/app/api/v1/routes/auth.py::_run_exchange`: checks local user active before entitlement evaluation.
- `apps/backend/app/api/v1/routes/ops_keys.py`: override create/revoke requires `entitlements:override` and admin/super_admin/ops role, one target dimension, active product/tenant-linked user, reason, <=90-day expiry and durable audit.
- `apps/backend/tests/unit/test_entitlements.py`: all four modes, product-scoped subscription, expired subscription, inactive service hard deny, expired/revoked override and individual override.
- `apps/backend/tests/api/test_entitlement_overrides.py`: HTTP-level authorization and audit coverage (test file exists; inspect exact cases before final pass).

Open checks:
- Direct access route uses a separate membership check and email-based lookup, and does not share the exchange flow's canonical identity contract. See #159/#165.
- Verify all entitlement override and ProductLink operations are mounted and protected as expected; no requirement for a UI.

### #164 — Revocation, signing-key rotation and freshness

**Result: issuer-side N5 hardening has CI evidence; five-minute end-to-end acceptance remains UNPROVEN.**

Evidence:
- PR #157 merged at `17d38a3ca2ff1323c73577b30c591a28181bfd70`.
- Latest reported validated implementation head `801d925fec459fe8cc2c8095c2626d1415eb1fe9`: Backend CI 218 tests, 74.93% coverage, per-file coverage passed and Alembic upgrade/downgrade/re-upgrade passed; Docker/PostgreSQL/Redis readiness passed.
- Issuer token TTL is hard-capped at 240 seconds. N5 docs require resource server JWKS refresh <=60 seconds and clock leeway <=60 seconds.
- Rotation uses PostgreSQL advisory transaction lock and age recheck; emergency revocation retires target key and publishes replacement if active; JWKS reads PostgreSQL rather than Redis.

Acceptance gap:
- The five-minute limit is not established by issuer CI alone. A product verifier that does not refresh JWKS within the stated bound, accepts excessive clock skew, or fails to stop accepting revoked keys could exceed it. Also, normal grant removal relies on the remaining lifetime of already issued product tokens.
- No measured end-to-end test against a real verifier or staging consumer was found in the inspected evidence. Do not mark #164 passed.

### #165 — Product integration contract and operations

**Preliminary result: core endpoints exist; a conflicting legacy endpoint and dependency questions remain.**

Evidence:
- Mounted API routes in `apps/backend/app/api/v1/api_router.py`: `/users`, `/auth` (including exchange and JWKS), `/access`, `/services`, `/ops`, `/billing`.
- Frontend BFF `apps/frontend/src/app/api/nethub/auth/exchange/route.ts` keeps backend URL and IdP access token server-side; it calls `/auth/exchange` using Auth.js session.
- `apps/backend/app/main.py`: startup checks PostgreSQL query + signing_keys table and Redis PING; exchange-enabled startup bootstraps signing keys. `/ready` checks DB and Redis.
- `apps/backend/app/db/session.py`: PostgreSQL async engine configured with pool_pre_ping and UTC timezone.
- `apps/backend/docs/AUTH_MATRIX.md` and `PRODUCT_CLAIM_PROFILES.md` describe the intended token/JWKS contract.

Findings:
- **Legacy direct-IdP access endpoint is mounted** at `GET /api/v1/access/{product_slug}`. Its handler explicitly describes IdP bearer → principal JSON, does not mint a product JWT, and calls `resolve_product_access`, which finds the local user by email. This is inconsistent with the approved architecture contract. If retained temporarily, it needs a named consumer, explicit compatibility flag, threat boundary and removal/expiry criteria; otherwise it should be disabled/removed. This validation pass makes no implementation change.
- Product API exchange and JWKS paths are documented, but integration contract must identify the exact issuer and audience values and token-profile requirements per registered product.
- Redis is currently a hard startup dependency even though it is described as cache/coordination, while PostgreSQL is correctly hard-required. Determine whether Redis unavailability is intended to prevent all NetHubKe service startup or whether only cache-dependent operations should degrade. Do not change this without validating actual redis usage and operational contract.


## Confirmed security findings from cross-route inspection — 2026-11-01

### Finding F-01 — Legacy access endpoint bypasses canonical identity resolution
**Severity:** High; blocks treating the product integration boundary as ready.
**Affected:** #159, #163, #165.

- `apps/backend/app/api/v1/api_router.py` mounts `access.router` under `/api/v1/access`.
- `apps/backend/app/api/v1/routes/access.py::get_product_access` uses `Depends(get_token_data)`, not `get_current_user` / `require_scopes`.
- `get_token_data` only validates the upstream JWT; it does not require a canonical `UserIdentity` mapping.
- `apps/backend/app/services/access.py::resolve_product_access` resolves the local account with `user_crud.get_by_email(token_data.email)`, then returns its membership and external user/org mapping.
- The route is not gated by the product exchange feature flag and explicitly implements the old IdP-bearer → principal JSON flow.
- Unit tests exist for the service, but no route-level acceptance test was found proving that an unlinked issuer+subject with a matching email is rejected.

**Impact:** This creates a second product access path that bypasses the approved canonical issuer+subject resolution and can treat email as identity. It can expose a local account's product principal to a valid but unmapped upstream identity whose email matches. It also conflicts with the approved NetHub-issued product JWT trust model.

**Required disposition:** Disable/remove this path from the default product integration contract, or isolate it behind an explicitly approved, named, time-bounded compatibility flag and make it resolve canonical identity before returning anything. No change made during validation.

### Finding F-02 — Protected tenant-scoped routes re-resolve users by token email
**Severity:** High; authorization/tenant isolation risk.
**Affected:** #159, #163, #165.

- `apps/backend/app/api/deps.py::get_current_user` correctly resolves the canonical user by exact validated issuer+subject and checks the account is active.
- After that check, several routes discard the resolved local user and look it up again by mutable `token_data.email`:
  - `apps/backend/app/api/v1/routes/product_links.py::set_my_product_link` and `list_my_product_links`.
  - `apps/backend/app/api/v1/routes/billing.py::_tenant_id_for_user`.
  - `apps/backend/app/api/v1/routes/services.py::my_service_status`.
- The local email can change after a verified IdP email update. A still-valid access token can carry the previous email; if that address is subsequently assigned to another local account, the canonical identity check authenticates user A, but the route's second email lookup can select user B and use B's tenant context.
- In the product-link mutation route, this can direct an owner-authorized request to the wrong tenant's external organization mapping. Billing/status routes can similarly resolve the wrong tenant.

**Required disposition:** Tenant-scoped handlers must use the canonical local user resolved from issuer+subject, not perform a second lookup using email. Add regression coverage for stale email claims after an identity's email has changed and the old address belongs to another account. No code change made during validation.

### Finding F-03 — Product audiences are not unique
**Severity:** High; product isolation contract gap.
**Affected:** #160, #161, #162.

- `Product.slug` is unique, but `Product.audience` is not.
- Migration `apps/backend/alembic/versions/e8f9a0b1c2d3_add_products.py` creates a unique index only on `products.slug`; no audience uniqueness constraint/index exists.
- Exchange signs the token with the audience stored on the selected Product row (except the server-side Tawala compatibility override).
- `docs/PRODUCT_CLAIM_PROFILES.md` says product tokens must not be accepted by another product and that audience is the exact resource-server boundary.

**Impact:** Two products can be registered with the same audience. A verifier enforcing the required issuer/audience/algorithm contract could accept a token issued for the other product if it does not additionally enforce the custom `product` claim. That makes isolation depend on every downstream verifier implementing an extra undocumented assumption.

**Required disposition:** Enforce unique product audiences (including a deliberate migration/data check) or define and require a cryptographically/contractually enforced alternative per-product verifier discriminator. No migration or implementation change made during validation.

### Supporting cross-route evidence

- `apps/backend/app/api/v1/routes/product_links.py`: owner role and user:write scope are checked, but tenant lookup is by email after canonical auth dependency.
- `apps/backend/app/api/v1/routes/billing.py`: tenant context is derived by email lookup after user:read scope.
- `apps/backend/app/api/v1/routes/services.py`: product status is derived by email lookup after user:read scope.
- `apps/backend/app/api/v1/routes/access.py` and `apps/backend/app/services/access.py`: legacy direct IdP access path uses email lookup before canonical mapping.
- `apps/backend/app/db/models/models.py::Product` and product registry migration: slug uniqueness exists; audience uniqueness does not.

## Revised preliminary status

| Issue | Status | Reason |
|---|---|---|
| #158 | Partial | OIDC and JWT validation implementation/tests present; live Zitadel and protected-session edge cases still to verify. |
| #159 | **Gap found** | Canonical identity core is implemented, but mounted legacy access route bypasses it; email re-lookups remain in tenant-scoped routes. |
| #160 | **Gap found** | Product registry and active-state checks exist, but product audience is not unique. |
| #161 | Partial | Token exchange and claim tests exist; depends on resolving audience isolation gap. |
| #162 | Partial | JWKS issuer behavior tested; actual resource-server verifier behavior not represented in this repo. |
| #163 | **Gap found** | Central entitlement evaluator is implemented/tested, but tenant-scoped routes have email-based re-resolution risk; legacy access path bypasses canonical identity. |
| #164 | **Unproven** | N5 issuer CI passed; five-minute end-to-end stale-access bound has not been measured. |
| #165 | **Gap found** | Core exchange/JWKS contract exists, but the old direct-IdP access endpoint remains mounted and conflicts with the approved product trust model. |


### Finding F-04 — Upstream bearer tokens are exposed through the browser session
**Severity:** Medium–High; unnecessary credential exposure.
**Affected:** #158, #165.

- `apps/frontend/src/auth.ts::callbacks.session` copies `token.accessToken` and `token.idToken` into the returned Auth.js session.
- Auth.js exposes the session callback result through its session endpoint and `useSession()`; this makes both upstream bearer/ID tokens available to browser JavaScript.
- `apps/frontend/src/lib/hooks/useauth.tsx` returns `session.accessToken` to client components.
- `apps/frontend/src/app/(private)/dashboard/services/page.tsx` passes the token to `LaunchButton`; `LaunchButton` only checks whether it exists. Actual exchange is performed through the same-origin BFF, which independently reads the server-side Auth.js session.
- `apps/frontend/src/app/api/nethub/auth/exchange/route.ts` and other BFF routes use server-side `auth()` and do not require the token to be present in the browser-visible session object.

**Impact:** Access and ID tokens are unnecessarily exposed to client-side JavaScript. This increases the impact of an XSS or compromised third-party client script and is not required for the BFF exchange design.

**Required disposition:** Keep access/ID/refresh tokens server-side; remove accessToken/idToken from the public session shape and client hook. Replace the LaunchButton's token-presence check with an authenticated/backend-ready boolean. Add a test asserting the public session response contains no upstream tokens while server-side BFF calls continue to work. No code change made during validation.

### Additional evidence — OIDC and frontend trust boundary

- `apps/frontend/src/auth.ts` configures one Auth.js OIDC provider and delegates the authorization callback to Auth.js; no local password provider is configured.
- `apps/frontend/src/lib/server/oidcConfig.ts` obtains OIDC discovery metadata from the configured issuer and caches it in-process.
- Auth.js session fallback when `/users/sync` fails is intentional in the current code. The profile hook then calls the backend `/users/me`; product exchange and protected backend APIs still enforce their own identity checks. This fallback is not, by itself, proof of product access.
- The browser-visible access/ID token exposure is a separate avoidable security issue and is recorded as F-04.

## Revised preliminary status (after frontend review)

| Issue | Status | Reason |
|---|---|---|
| #158 | **Gap found** | OIDC is delegated to Auth.js and API token validation is present, but access/ID tokens are exposed in the browser-visible session. Live Zitadel verification remains outstanding. |
| #159 | **Gap found** | Canonical identity core is implemented, but the legacy access route bypasses it and several tenant-scoped routes re-resolve by mutable email. |
| #160 | **Gap found** | Product registry exists, but audience uniqueness is not enforced. |
| #161 | Partial / dependent | Product-specific exchange and claim tests exist; isolation depends on fixing unique audience registration and verifier contract. |
| #162 | Partial | JWKS issuer behavior is tested; product verifier behavior remains unproven. |
| #163 | **Gap found** | Entitlement evaluator is implemented/tested, but the email-based tenant re-resolution and legacy access path undermine identity-to-tenant binding. |
| #164 | **Unproven** | N5 issuer CI passed; five-minute end-to-end stale-access bound has not been measured. |
| #165 | **Gap found** | Core exchange/JWKS BFF contract exists, but the legacy direct-IdP route and browser token exposure conflict with the intended trust boundary. |


### Finding F-05 — Upstream audience configuration is inconsistent across defaults and documentation
**Severity:** Medium; integration configuration ambiguity.
**Affected:** #158, #165.

- `apps/backend/app/core/config.py` defaults `AUDIENCE` to `nethub-api`.
- `apps/backend/.env.example` also uses `AUDIENCE=nethub-api`.
- `.github/workflows/backend-ci.yml` and `backend-readiness.yml` use `AUDIENCE=nethub-backend`.
- `apps/backend/docs/AUTH_MATRIX.md` describes the default as `nethub-backend`.

The runtime setting is environment-overridable, so this is not proof of a production misconfiguration. However, the default and documented contract disagree. A deployment that omits the override may reject valid Zitadel access tokens or accept a different configured audience than the integration team expects.

**Required disposition:** Select one canonical default or make the deployment-required value explicit, then align config comments, examples, AUTH_MATRIX and CI. Verify actual deployed value before enabling exchange. No environment or code change made.

### Validation of route-level test coverage

- `apps/backend/tests/api/test_billing.py` contains only an unauthenticated-request test; it does not test tenant resolution or tenant isolation.
- `apps/backend/tests/api/test_auth_exchange.py` checks that product-links requires authentication, but does not test product-link tenant binding or stale email claims.
- `apps/backend/tests/unit/test_membership_access.py` tests the legacy access service's happy/negative cases but not the HTTP route's canonical identity requirement.
- No route-level regression test was found for an unlinked subject sharing an existing account email on `/access/{product_slug}`.
- Identity lifecycle tests verify sync and profile resolution by issuer+subject, but do not cover the downstream email re-resolution issue in billing/product-links/services.

These are targeted missing tests for identified security boundaries, not a request for broad coverage expansion.

### Configuration and dependency observations

- Backend CI has Postgres 16 and Redis services and runs pytest with 70% overall coverage plus per-file coverage checks; Alembic upgrade → downgrade → upgrade is part of backend CI.
- Backend readiness workflow builds and boots the API with Postgres+Redis and probes `/health` and `/ready`.
- `apps/backend/app/main.py` hard-fails startup if Redis PING fails; `redis_get`, `redis_set` and `redis_delete` themselves catch errors and degrade to miss/no-op. Since current JWKS responses are PostgreSQL-backed and Redis is not an entitlement authority, this is an availability policy decision rather than a token-security control. It is not counted as a checklist failure without evidence that Redis is required for another critical path.
- Product registry is controlled by PostgreSQL records/migrations; no product CRUD/admin route is mounted. The model is generic enough to represent products, and the claim-profile docs describe manual registration. A catalogue UI or public self-service registration is not required for this readiness scope.
- ProductLink has a unique database constraint on (tenant_id, product_id), so duplicate tenant/product links are prevented at the database layer.

## Validation limits

- This pass inspected the `dev` source tree and repository tests/docs through GitHub. No local checkout or executable local PostgreSQL test run was available in this runtime.
- Historical CI evidence is attributed to the exact commit/head recorded in the trackers/PR, not presented as a new run performed by this validation.
- No live Zitadel staging login, actual deployed environment values, or real product resource-server verifier was available for measurement.
- No code, migration, deployment, feature flag or issue state has been changed. The only repository write is this findings document on `validation/ecosystem-readiness`.

## 2026-11-03 current-branch reconciliation (supersedes stale findings where noted)

**Source of truth:** current implementation on `feat/first-client-idp-agnostic-bff`, based on PR #170 head. The earlier findings below were recorded against an older state and must not be repeated as current facts without checking the named files.

### Corrected findings

- **Canonical user resolution / route scoping:** current `users/me`, `product_links`, `billing` and `services/my-status` handlers use `get_current_user_record`. The earlier concern that these routes re-resolved users by email is no longer current. Identity lifecycle is covered by `tests/api/test_identity_lifecycle.py`; issues #159 and #163 were closed after code/test review.
- **Legacy Path A access endpoint:** `apps/backend/app/services/access.py` remains as a service, but the current `api_router.py` does not mount an `access` router. The direct upstream-token access endpoint is therefore not an active public route. Issue #137 was closed as superseded; do not treat the unused service module as a live API.
- **Product audience uniqueness:** PR #170 branch contains `Product.__table_args__` with `uq_products_audience` and migration `m6g7h8i9j0k1_unique_product_audiences.py`. The migration checks duplicates and fails with the conflicting audiences/slugs rather than silently rewriting rows. Tracked by #172; included in the consolidated branch.
- **Auth.js public session:** the current session callback intentionally does not copy `accessToken`, `refreshToken` or `idToken` into the public session. The actual failure was that BFF handlers nevertheless read `session.accessToken`, so authenticated BFF requests could not obtain the bearer. Issue #171 fixes this through server-side decoding of the encrypted Auth.js JWT cookie.
- **Product token exposure:** the existing exchange BFF returned the upstream product-token response to browser code and the launch helper placed the token in a URL fragment. The branch disables the browser exchange endpoint with HTTP 410 and disables the launch helper. Secure product launch is not claimed complete.
- **Provider-specific OIDC assumptions:** the earlier dev code used vendor-specific endpoint fallbacks and role parsing. Issue #80 and this branch replace these with discovery-advertised JWKS/UserInfo/token/logout endpoints and an explicit configurable role-claim path. The branch passed backend CI (237 tests, 77.46% coverage), frontend lint/build and 11 auth/BFF security tests; alternate discovery endpoint layouts are covered by backend tests.

### Still open / not proven

- Five-minute stale-access bound remains unproven end-to-end across actual product verifiers, token refresh, JWKS caches and clock skew (#164).
- Product-side local verifier interoperability remains outside this website BFF implementation (#162).
- Product launch is disabled pending a single-use, short-lived launch-code redemption flow; do not enable the old token-fragment flow.
- Product audience migration and provider-neutral OIDC code require fresh backend CI and Alembic upgrade/downgrade evidence.
- Website BFF requires frontend lint/build and a real browser integration check: OIDC callback → successful `/users/sync` → profile/services BFF calls → federated logout.

### Branch implementation evidence

- Branch: `feat/first-client-idp-agnostic-bff`
- Parent commit: `73ecbcea14e01af84807f4518c4a0171f006a52c`
- New issue: #171 (website BFF), existing issue #80 (provider-neutral OIDC), #172 (unique product audiences).
- Validation status: CI green (backend 237 passed, 77.46%; Alembic upgrade/downgrade/re-upgrade; Docker/Postgres/Redis readiness; frontend lint/build; 11 auth/BFF tests). OIDC-configured browser smoke remains pending.


## Final review note — 2026-11-03

- PR #173 is open, mergeable and targets `dev`; PR #170 is closed as superseded. Latest branch head: `5b71c6a7820af93ece705e9fc8416c6754b3c064`.
- Latest GitHub Actions: backend CI 41622960491 (237 passed, 77.51% coverage; Alembic upgrade/downgrade/re-upgrade passed), readiness 41622960484 (Docker/PostgreSQL/Redis passed), frontend CI 41622960475 (lint, production build, 11 security tests passed).
- Vercel status reports `build-rate-limit`; the GitHub Actions frontend production build is green, but no Vercel preview URL is available. This is a preview-platform limit, not a failed application build.
- Remaining related open work: #171 browser smoke with configured OIDC credentials; #162 product-side local verifier evidence; #164 measured five-minute stale-access behavior; #165 product integration validation; #149 secure one-time launch-code handoff; #150 billing/settings/operational readiness.
- #80/#79/#81/#158/#160/#172 are linked to PR #173 and will close on merge. #148/#152/#161 and already-complete/superseded issues have been closed with evidence. #57 and #135 remain open as programme/history records.
