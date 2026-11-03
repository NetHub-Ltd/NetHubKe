# NetHubKe API — Authentication / Authorization Matrix

## 1. Trust boundaries

- **Zitadel:** sole identity provider and token issuer.
- **NetHubKe API:** protected resource server and centralized authorization/resource API. It validates Zitadel access tokens, resolves canonical identity and enforces NetHubKe-managed resource/service access.
- **NetHubKe website, Tawala and NetPay:** clients using the same API audience and bearer-token validation contract. Each has its own Zitadel OIDC client registration.
- **Product applications:** retain their own domain roles and resource-level authorization.
- **PostgreSQL:** authoritative identity, tenant, product and entitlement state. Redis is a disposable cache.

NetHubKe does not provide login/password management, OAuth authorization-server endpoints, token brokering or replacement API tokens.

## 2. Upstream access-token validation

| Setting | Purpose |
|---|---|
| OIDC_ISSUER | Exact configured Zitadel issuer and discovery-document base |
| AUDIENCE | Shared NetHubKe API audience; not a client ID |
| ALGORITHMS | Explicit asymmetric signing-algorithm allowlist; RS256 is current default |
| JWKS_CACHE_TTL | Upstream JWKS cache TTL, hard-capped at 300 seconds |
| OIDC_ROLE_CLAIM_PATH | Optional dot-separated role claim path |

NetHubKe fetches OIDC discovery from the configured issuer, requires exact discovery issuer equality and uses the advertised jwks_uri and userinfo_endpoint. Discovery is cached for 300 seconds. The JWKS client cache is bounded to at most 300 seconds.

The current validator checks signature, configured algorithm, issuer, API audience, exp, iat and sub; present nbf is validated. It applies 10 seconds of clock leeway. Missing/invalid credentials fail closed. When UserInfo enrichment is used, its subject must be present and exactly match the validated access-token subject; the current implementation still needs this fail-closed correction.

The API audience must be distinct from client IDs so a client ID token is rejected. Verify this against the actual Zitadel project configuration and include an ID-token rejection test. Do not assume a provider-independent typ/token_use marker.

A valid upstream token is not sufficient by itself: protected resources also require a mapped, active canonical local user and required scopes.

## 3. Canonical identity and scopes

- Canonical mapping key: exact issuer + subject.
- Email is mutable profile data and is never an identity key.
- POST /users/sync may initialize the caller's identity from a valid access token. Email-only linking is rejected; explicit account linking is a separate privileged operation with verified identity proof.
- get_current_user validates the bearer, resolves the canonical identity and rejects inactive/deleted users.
- require_scopes applies operation-specific scopes after authentication.
- Tenant context is resolved from the canonical local user, not caller-supplied IDs.

## 4. Route matrix

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| GET | /health | None | Liveness |
| GET | /ready | None | PostgreSQL/schema readiness |
| GET | /api/v1/services/get-services | None | Public catalogue; not an entitlement grant |
| POST | /api/v1/users/sync | Valid Zitadel access token | Initialize canonical identity |
| GET | /api/v1/users/me | Active canonical user + user:read | Own profile |
| PATCH | /api/v1/users/me | Active canonical user + user:write | Own allowed profile fields |
| GET | /api/v1/services/my-status | Active canonical user + user:read | Product connection/link status only; not entitlement |
| GET | /api/v1/services/{slug}/access | Required: active canonical user + user:read | Authoritative service-access decision; reuse entitlement evaluator |
| GET | /api/v1/users/me/product-links | Active canonical user + user:read | Links scoped to caller tenant |
| PUT | /api/v1/users/me/product-links | Active canonical user + user:write + owner/admin policy | Sensitive link mutation with durable audit |
| GET | /api/v1/billing/summary | Active canonical user + user:read | Own tenant billing summary |
| POST | /api/v1/services/seed-services | Active canonical user + services:admin | Admin catalogue seed |
| POST | /api/v1/services/create-service | Active canonical user + services:admin | Admin catalogue mutation |

## 5. Authoritative service access

The existing GET /services/my-status reports link/connection state and uses a free-tier heuristic for trial. It is not an authorization decision.

The required GET /services/{slug}/access resource must resolve the active canonical user, resolve the registered product/service, deny unknown/inactive/deleted records, reuse app/services/entitlements.py::check_entitled for subscription/membership/policy/override evaluation, and return a minimal typed allow/deny result with a stable reason code.

Do not trust caller-supplied user/tenant IDs, roles, organization IDs or entitlements. Do not duplicate the evaluator.

## 6. Legacy product-token subsystem — disabled, not client contract

The repository retains POST /api/v1/auth/exchange and the Tawala alias, GET /api/v1/auth/jwks.json, product-token signing/key-management services and related schema/configuration.

PRODUCT_TOKEN_EXCHANGE_ENABLED defaults to false. Keep it disabled. These endpoints are not part of the shared Zitadel access-token contract and must not be used to call NetHubKe APIs.

Audit actual deployed Tawala/NetPay and external consumers before removal. If there is no separately approved product-API use, remove exchange/JWKS/key management, schema and configuration as one coherent cleanup. Do not extend it or add launch-code redemption.

## 7. Freshness and failure behavior

Current repository facts:
- Canonical user state is checked against PostgreSQL on protected requests.
- Entitlement evaluation reads PostgreSQL and has no entitlement cache.
- OIDC discovery cache: 300 seconds.
- JWKS cache: configurable, hard-capped at 300 seconds.
- JWT clock leeway: 10 seconds.
- Actual Zitadel access-token TTL and IdP-side account-disable propagation are not yet evidenced.

Keep the five-minute stale-access requirement open until actual token lifetime, JWKS behavior, clock tolerance and revocation propagation are measured end-to-end. Do not use the former 240-second product-token TTL as evidence.

Missing/invalid/expired bearer returns 401; missing scope, disabled/deleted user and missing entitlement return 403; unknown/inactive service returns 404/403 according to disclosure policy. Discovery/JWKS/database unavailability fails closed.

## 8. Focused test locations

- apps/backend/tests/unit/test_security.py
- apps/backend/tests/unit/test_security_userinfo.py
- apps/backend/tests/api/test_users_auth_required.py
- apps/backend/tests/api/test_users_happy.py
- apps/backend/tests/api/test_services.py

Add focused tests for the shared client conformance matrix and authoritative service-access resource. GitHub Actions is the execution evidence. No live Zitadel client conformance or five-minute staging proof is currently recorded.
