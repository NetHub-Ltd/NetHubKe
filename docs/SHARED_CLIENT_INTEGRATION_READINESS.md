# NetHubKe Shared IdP Resource-Server Readiness

**Audit baseline:** `dev` at `fdb4a3eabbd8a385d9d96ee12344d89fa52fdd29` (2026-11-03)  
**PR #173:** merged into `dev`  
**Scope:** backend only — NetHubKe website, Tawala and NetPay are clients of the same NetHubKe API  
**Identity provider:** Zitadel — `https://auth.nethub.co.ke`

## 1. Required architecture

Zitadel is the only identity provider and token issuer. NetHubKe is a resource server and centralized authorization/resource API.

- Zitadel owns login, OIDC authorization flows, sessions, signing keys, access/refresh/ID token issuance and token lifecycle.
- Each client authenticates with Zitadel using its own registered OIDC client configuration.
- Each client presents a Zitadel-issued **access token** to NetHubKe as a bearer token when requesting NetHubKe resources.
- NetHubKe validates the access token, resolves the canonical local identity by exact issuer + subject, checks local account state and the required scopes/policies, then returns only authorized resources.
- The three clients share the same API audience and validation path. Their OIDC client IDs/redirect URIs and user experiences may differ. Do not confuse the OIDC client ID with the API audience.
- Product applications retain authorization over their own domain data and actions. NetHubKe does not replace product-owned business permissions.

NetHubKe must not become a second IdP, OAuth authorization server, password store, token broker or issuer of replacement credentials for clients calling NetHubKe APIs.

## 2. What is already implemented on merged `dev`

| Area | Evidence in code | Audit result |
|---|---|---|
| Provider-neutral discovery | `apps/backend/app/core/security.py` | Fetches OIDC discovery from configured issuer, requires exact discovery issuer match and uses advertised JWKS/UserInfo endpoints. Discovery cache is 300 seconds. |
| JWT signature and claim validation | `core/security.py::_decode_token` | Uses PyJWT/JWKS; validates configured algorithm list, exact issuer, configured audience, expiry, required `exp`, `iat`, `sub`; applies 10-second leeway. Present `nbf` is validated by PyJWT. |
| JWKS refresh | `core/security.py::_get_jwks_client` | Process-local PyJWKClient, key-set cache TTL is configured and hard-capped at 300 seconds; individual signing-key cache is disabled. |
| Canonical identity | `app/api/deps.py`, `app/crud/user.py` | Authenticated-user path resolves by issuer + exact subject and rejects missing, deleted or inactive local users. Email is not the identity key. |
| First-login sync | `routes/users.py`, `crud/user.py::get_or_create` | Valid IdP bearer can initialize a canonical account. Email-only matching is rejected; explicit identity linking is separate. User/tenant/identity creation is transactional. |
| Scope enforcement | `app/api/deps.py::require_scopes` | Reusable dependency checks required scopes after token validation and active canonical-user resolution. |
| Existing protected resources | `routes/users.py`, `routes/services.py`, `routes/billing.py`, `routes/product_links.py` | Profile, billing, service-status and product-link operations use authenticated-user and/or scope dependencies. Public service catalogue remains public. |
| Entitlement evaluator | `app/services/entitlements.py::check_entitled` | Evaluates active product/service, subscription period, individual membership and time-bound overrides against PostgreSQL. |
| Website BFF baseline | PR #173 | Merged. Frontend/BFF changes are not part of this backend audit or the next backend implementation scope. |

### Token contract qualifications still to verify

1. `OIDC_ISSUER` and `AUDIENCE` are configurable. The example audience is `nethub-api`; the actual Zitadel project/resource configuration has not been evidenced here.
2. All three client registrations must request access tokens intended for this API audience. The API audience must be distinct from client IDs so an ID token issued to a client is rejected as an API bearer by audience validation.
3. Current validation defaults to RS256, but `ALGORITHMS` is configurable. Production configuration must be checked to ensure only approved asymmetric signing algorithms are enabled.
4. The validator does not use a universal `token_use`/JWT `typ` marker to distinguish ID and access tokens. OIDC providers do not all use the same access-token header convention; the decisive contract is the API audience and the actual Zitadel token profile. Add a configured-token test proving an ID token for each client is rejected.
5. The validator enriches missing email claims via UserInfo and requires email in `TokenData`. Email is profile/sync data only; it must never become the canonical identity key.
6. Unit tests use mocked discovery and locally signed test JWTs. No live Zitadel issuer/audience/scope/client conformance test has yet been recorded.

## 3. Concrete gaps

### G1 — No authoritative service-access decision resource

`GET /api/v1/services/my-status` is not an authorization decision. Its current `trial` result is inferred from a tenant tier, and `connected` is inferred from a product link. Neither proves that the caller is entitled to use a product.

The existing `check_entitled` evaluator is currently called by the product-token exchange path. The exchange is globally default-off (`PRODUCT_TOKEN_EXCHANGE_ENABLED=false`), so clients do not currently have an enabled, direct API resource through which to ask NetHubKe whether the canonical user/tenant is entitled to a registered product.

**Necessary backend work:** expose one client-neutral, read-only service-access decision using the existing evaluator and the authenticated canonical user. Keep connection/link status separate from entitlement. Do not create a second policy engine or duplicate entitlement rules. Define the minimal response shape and deny safely for unknown/inactive products.

### G2 — Confirm one shared access-token contract against Zitadel

The validation code is present, but the deployed Zitadel API audience, scopes/permissions claims, role mapping and all three client registrations are not evidenced by repository tests.

**Necessary backend work:** freeze the issuer, API audience, accepted algorithms, required claims and scope names; add focused tests for valid access token, wrong issuer/audience, client ID token, expired/not-yet-valid token, invalid signature, missing subject and missing required scope. Keep client IDs distinct from the shared API audience. Do not introduce client-specific token formats.

### G3 — Complete client-neutral protected-resource acceptance

The shared dependency exists, but no acceptance matrix proves that the website, Tawala and NetPay all use the same API contract. No frontend work is included here.

**Necessary backend work:** add a backend conformance suite that exercises the same bearer-token and canonical-user behavior for each configured client identity. Verify active/disabled/unlinked users, scope denial, cross-tenant resource isolation, product access allowed/denied and public catalogue behavior.

### G4 — Measure the actual stale-access bound

Current backend facts:
- Canonical user active/deleted state is read from PostgreSQL during authenticated requests.
- `check_entitled` reads entitlement data from PostgreSQL; it does not use an entitlement cache.
- OIDC discovery cache is 300 seconds; upstream JWKS cache is capped at 300 seconds.
- JWT validation uses 10 seconds of clock leeway.
- No live measurement of Zitadel access-token lifetime, disabled-user propagation from Zitadel, or deployed signing-key rotation behavior is recorded.

**Necessary backend/security work:** establish the actual Zitadel access-token TTL and verify the configured clock tolerance/JWKS behavior. Prove that NetHubKe-side account disablement and entitlement removal deny the next protected API request. Decide and document how IdP-side account disablement is propagated or bounded. Keep the five-minute requirement open until measured; do not infer it from the old NetHubKe product-token TTL.

## 4. Product-token issuer: do not extend; audit before removal

The merged backend still contains:
- `POST /api/v1/auth/exchange` and the Tawala alias;
- public `GET /api/v1/auth/jwks.json`;
- product-token signing/key-management service and signing-key operations;
- product-token configuration and related persistence.

The exchange is globally default-off and PR #173 disables the browser exchange path. This product-token system is not required for a client to call NetHubKe APIs using a Zitadel access token.

Consumer audit performed against the currently exposed product branches:
- NetPay `dev` uses its own HS256 M2M credentials for NetPay API access. I found no NetHubKe OIDC/JWKS integration or NetHubKe product-token verifier in the inspected backend paths. This M2M mechanism is separate from user authentication and must not be confused with the NetHubKe client contract.
- Tawala Core `main` exposes local password registration/login/logout and its own sessions. I found no NetHubKe OIDC/JWKS integration in the inspected paths. This is not yet the agreed shared IdP client integration and needs a separate Tawala backend migration plan; do not change it in this NetHubKe backend task.

This is not sufficient evidence to delete the issuer: confirm the actual deployed Tawala/NetPay backends and any external consumers first.

**Decision:** do not add launch-code redemption, product-token consumers or more signing-key functionality. Keep exchange disabled. Once all actual consumers are accounted for, remove/deprecate the exchange/JWKS/key-management subsystem and its schema/config if no independently approved product-API use remains. Do not use these tokens as credentials for NetHubKe API requests.

## 5. Documentation conflicts to correct

These merged documents still describe the superseded token-issuer architecture and must be aligned before they are treated as the source of truth:

- `docs/SSO_ARCHITECTURE_CONTRACT.md`: currently assigns product-facing token issuance to NetHubKe and says product APIs validate NetHubKe-issued JWTs.
- `docs/CLIENT_INTEGRATION_CONTRACT.md`: currently makes NetHubKe-issued product JWTs the product API contract and includes a launch/exchange boundary.
- `apps/backend/docs/AUTH_MATRIX.md`: currently describes NetHubKe as product-token issuer and product JWKS as a standard client integration.

The correction is to define Zitadel-issued access tokens as the credential presented to NetHubKe APIs by all clients. Keep product-domain authorization inside each product. Do not do frontend redesign as part of this correction.

## 6. Minimal delivery milestones

### Milestone 1 — Shared resource-server contract and access decisions

**Outcome:** all clients can use the same Zitadel access-token contract to request NetHubKe resources and authoritative access decisions.

- Freeze actual Zitadel issuer, shared API audience, accepted asymmetric algorithms and scope/claim mapping.
- Retain one OIDC access-token validator and one canonical identity resolver.
- Add the minimal read-only product/service access decision endpoint, reusing `check_entitled`; do not treat `my-status` as an entitlement decision.
- Audit all protected routes for the shared auth dependency and tenant scoping; add only missing guards.
- Update the three conflicting architecture/API contract documents.
- Keep product-token exchange disabled; perform the consumer audit before deleting it.

### Milestone 2 — Security and client acceptance

**Outcome:** the shared API contract is proven, including the five-minute access-freshness requirement.

- Add focused access-token, scope, canonical identity, entitlement and cross-tenant tests.
- Run the same backend conformance cases for website, Tawala and NetPay client registrations.
- Measure actual Zitadel token lifetime, JWKS refresh, clock skew and IdP account-disable propagation.
- Prove local account disablement and entitlement revocation deny access within the agreed bound.
- Record staging evidence and operational failure behavior.

## 7. Explicit exclusions

- No NetHubKe login, password, session, OAuth authorization-server or token-issuance implementation.
- No NetHubKe product JWT as a credential for calls to NetHubKe APIs.
- No launch-code or second token-exchange protocol.
- No product frontend, website frontend or BFF redesign.
- No replacement of product-owned business roles/permissions.
- No new client registry, client-secret table or schema unless an evidenced backend requirement emerges.
- No production deployment or feature-flag enablement.

## 8. Files in the implementation boundary

- `apps/backend/app/core/security.py` — existing OIDC validation; change only for verified contract gaps.
- `apps/backend/app/core/config.py` and `apps/backend/.env.example` — actual issuer/audience/algorithm/scope configuration.
- `apps/backend/app/api/deps.py` — shared authentication/canonical-user/scope dependency.
- `apps/backend/app/api/v1/routes/services.py` — minimal authoritative service-access resource.
- `apps/backend/app/services/entitlements.py` — reuse existing policy evaluator; do not duplicate it.
- Relevant user/product/tenant models only if audit proves a missing relationship or lifecycle field.
- Focused backend tests under `apps/backend/tests/api` and `apps/backend/tests/unit`.
- `docs/SSO_ARCHITECTURE_CONTRACT.md`, `docs/CLIENT_INTEGRATION_CONTRACT.md`, `apps/backend/docs/AUTH_MATRIX.md`.
- `.trackers/task.md`, `.trackers/milestone.md`, `.trackers/repo-state.md`.

## 9. Issue disposition

- #173: merged; baseline accepted subject to live Zitadel configuration and browser smoke evidence.
- #159 and #163: retain completed status; code confirms canonical issuer/subject mapping and the entitlement evaluator. Route coverage/access-decision exposure is a separate gap.
- #162: its current product-JWKS/local-verifier objective is not required for clients calling NetHubKe APIs with Zitadel access tokens. Do not expand it. Close/reclassify only after the product-token consumer audit determines whether any separate product-API use remains.
- #164: keep open, but replace product-signing-key/revocation criteria with actual Zitadel access-token TTL, canonical-user/entitlement revocation and JWKS freshness evidence.
- #165: make this the grouped backend shared-client API contract and acceptance task; remove product-JWT and launch-code requirements.
- #171: frontend/browser smoke is outside this backend scope. Keep deferred; do not make it a backend milestone blocker.
- #149: launch-code handoff is outside the agreed architecture; do not implement it.
- #57: programme umbrella only; update its target to the shared IdP access-token/resource-server model.

No production configuration, schema, feature flag or runtime behavior has been changed by this audit.
