# NetHubKe Client Integration Contract

**Status:** Draft for review  
**Programme:** #57 — NetHubKe SSO Platform  
**Architecture baseline:** `docs/SSO_ARCHITECTURE_CONTRACT.md`  
**Planning context:** #142; N0–N10 sequence remains authoritative  
**Scope:** Website/BFF reference integration and reusable contracts for all future clients  
**Implementation status:** Contract for the first website client. Actual route readiness is tracked by implementation PRs and CI; this document does not enable product exchange or launch.

## 1. Non-negotiable integration rule

**A browser must never call the NetHubKe API directly. Every browser-originated NetHubKe request must pass through that application's server-side Backend-for-Frontend (BFF).**

For the NetHubKe website, the Next.js server is the BFF:

```text
Browser
  | same-origin HTTPS request; Auth.js session cookie only
  v
Next.js BFF (Route Handlers / Server Actions)
  | server-to-server HTTPS; credentials and tokens remain server-side
  v
NetHubKe API
  |
  v
PostgreSQL (source of truth) / Redis (optional cache)
```

The browser:
- Calls only same-origin website routes (for example, `/api/account/*` and `/api/services/*`).
- Never calls the NetHubKe hostname, API origin, or `/api/v1/*` endpoints.
- Never receives a the configured OIDC provider access token, refresh token, ID token, NetHubKe product token, client secret, signing key, or machine credential.
- Never receives NetHubKe's internal API base URL through a `NEXT_PUBLIC_*` variable, generated browser SDK, HTML, source map, or runtime configuration.
- Receives only the minimum application data needed to render the current page.

The BFF:
- Is the only component in a browser application permitted to call NetHubKe.
- Uses a server-only API client and server-only `BACKEND_URL` configuration.
- Authenticates the website session, obtains/refreshes upstream credentials server-side, and forwards only explicitly allowed operations.
- Returns filtered application DTOs, never upstream or product bearer tokens.
- Uses explicit route handlers rather than exposing a generic arbitrary-URL or arbitrary-path proxy.

This rule applies to every browser-based NetHub client, not just the NetHubKe website. Each browser product must use its own trusted server-side BFF. A mobile/native client or machine integration has no browser BFF; it uses its appropriate trusted server-side or native-client flow described below. No client may place a privileged NetHubKe credential in browser/mobile public configuration.

## 2. Client classes and common contract

| Client class | Authentication entry | NetHubKe transport | Token custody |
|---|---|---|---|
| Browser website / web product | the configured OIDC provider OIDC Authorization Code flow, handled by its BFF/Auth.js | Browser → same-origin BFF → NetHubKe | BFF only; browser gets an opaque HttpOnly session cookie |
| Native mobile / desktop | OIDC Authorization Code + PKCE using system browser | Native client uses a narrowly scoped public-client flow only if explicitly supported; privileged operations go through its trusted backend | OS secure storage for user tokens; no client secret or signing key |
| Product backend / machine client | Registered machine identity and client authentication | Server-to-server directly to NetHubKe | Backend secret store; scoped, audience-restricted machine token |
| Product resource API | NetHubKe-issued product JWT | No per-request NetHubKe call; local signature/JWKS validation | Product API process |

The transport may differ, but canonical identity, policy evaluation, product audiences, claim profiles, token lifetime, revocation semantics, and error meanings must be consistent.

Product APIs must not call NetHubKe for per-request introspection on hot paths. They validate NetHubKe-issued JWTs locally using JWKS and enforce product-owned business permissions.

## 3. Browser authentication and BFF session

1. The browser navigates to the website's sign-in route.
2. Auth.js initiates OIDC Authorization Code flow with the configured OIDC provider. The browser may be redirected to the configured OIDC provider's authorization endpoint; this is an OIDC navigation, not a browser API call to NetHubKe.
3. Auth.js handles the callback and code exchange on the server. PKCE/state/nonce validation is required; use a confidential client when the configured deployment has a client secret.
4. The BFF retains upstream access/refresh/ID tokens in server-only session state. If Auth.js JWT sessions are used, the session cookie must remain encrypted, HttpOnly, Secure in production, and unavailable to client JavaScript. Do not copy token fields into the public session callback.
5. The browser receives only the opaque session cookie and a safe session/profile DTO.
6. BFF route handlers call NetHubKe with the upstream access token whose issuer and audience are accepted by the configured NetHubKe API. The API audience must be explicitly configured and tested; `openid profile email` alone is not proof that the access token is intended for NetHubKe.
7. The BFF refreshes/reacquires upstream credentials server-side. If refresh fails or the upstream session is no longer valid, it clears or invalidates the application session and requires re-authentication.

A successful the configured OIDC provider login is not, by itself, proof that the NetHubKe account is active, linked, or entitled. The BFF must represent identity initialization and NetHubKe authorization failures distinctly; it must not silently substitute an IdP-only profile and present it as an initialized NetHubKe account.

### Cookie and request protections

- Production session cookies: `HttpOnly`, `Secure`, appropriate `SameSite` policy, narrow `Path`, and no broad parent-domain scope unless explicitly required.
- State-changing BFF routes: enforce same-origin/Origin and CSRF protections; do not rely on CORS as CSRF protection.
- Validate HTTP method, content type, request size, and input schema.
- Use explicit allowlisted server-side destinations. Never accept a caller-supplied NetHubKe URL, host, or arbitrary upstream path.
- Do not log Authorization headers, cookies, OIDC codes, access/refresh/ID tokens, product tokens, or secrets. Redact sensitive query/body fields and avoid tokens in URLs.
- Use HTTPS for BFF-to-NetHubKe traffic and fail closed on TLS/host configuration errors.
- Apply rate limits to authentication, sync, exchange, and other sensitive BFF operations.

## 4. BFF API surface exposed to the browser

The browser-facing API is owned by the website and is not the NetHubKe API. Route names below are proposed names, not claims that these handlers already exist.

| Browser request (same-origin only) | BFF responsibility | NetHubKe operation |
|---|---|---|
| `GET /api/session` | Return safe session state only | None |
| `GET /api/account/profile` | Require authenticated session; map safe profile DTO | `GET /api/v1/users/me` |
| `PATCH /api/account/profile` | Validate allowed profile fields; CSRF/origin checks | `PATCH /api/v1/users/me` |
| `GET /api/services` | Fetch/filter public service catalogue | `GET /api/v1/services/get-services` |
| `GET /api/account/service-access` | Return authoritative per-user/org access decisions only | Target access/status API; current `/services/my-status` must not be treated as authoritative entitlement evidence until its trial heuristic is replaced |
| `POST /api/services/{slug}/launch` | Authorize session, validate slug against server registry, initiate secure launch | Target launch/exchange boundary; never return product JWT to browser |
| `POST /api/auth/logout` | Clear local session and initiate federated logout | No general NetHubKe logout call unless a documented revocation/session endpoint is added |

Do not expose a catch-all `/api/proxy?url=...` or `/api/netHubKe/[...path]` route. Each BFF route must map to a known upstream operation and a typed response.

## 5. NetHubKe API contract consumed by the BFF

The current API paths below are observed in the repository. Their presence does not mean all are ready for production use.

| NetHubKe endpoint | Intended use | Contract notes |
|---|---|---|
| `POST /api/v1/users/sync` | First-login/JIT identity initialization | BFF forwards validated the configured OIDC provider access token server-side. Identity key is issuer + immutable subject; email is mutable profile data, never an account-linking key. Do not use as an every-request profile read. |
| `GET /api/v1/users/me` | Canonical profile read | Requires `user:read`; resolve by canonical upstream identity; disabled/deleted identities fail closed. |
| `PATCH /api/v1/users/me` | Own-profile update | Requires `user:write`; allow only explicitly user-editable fields. |
| `GET /api/v1/services/get-services` | Public service catalogue | Public catalogue metadata only; public availability is distinct from authentication requirements and entitlement. |
| `GET /api/v1/services/my-status` | Existing connection-status view | Current implementation uses a free-tier heuristic for `trial`; it is not sufficient as authoritative access/entitlement state. |
| `GET /api/v1/users/me/product-links` | Read linked product organization IDs | Authenticated user context; return only links belonging to the caller's tenant. |
| `PUT /api/v1/users/me/product-links` | Link tenant to product organization | Sensitive mutation; owner/admin policy, input validation and durable audit are required. Do not expose as an ordinary profile edit. |
| `POST /api/v1/auth/exchange` | Exchange upstream identity for product-specific JWT | Server-side BFF only. Request product slug only; do not trust caller-supplied principal, audience, subject, org ID, roles, or entitlement. Exchange is controlled by one global `PRODUCT_TOKEN_EXCHANGE_ENABLED` gate, default-off for every product until its milestone gates are accepted. There are no per-product exchange environment flags; the requested slug selects the registered Product row and its audience/policy. |
| `GET /api/v1/auth/jwks.json` | Product resource-server key discovery | Consumed by product backends/resource servers, not exposed as a browser credential endpoint. Public keys only. |
| `GET /api/v1/billing/*` | Read-only billing view when accepted | BFF maps only persisted billing data. No billing mutation/payment collection is implied. |

All routes must use versioned, typed request/response schemas and stable machine-readable error codes. The BFF may translate those into its own safe DTOs but must not weaken denials or turn upstream failures into success-shaped defaults.

## 6. Canonical identity and access decision

NetHubKe is authoritative for ecosystem identity and service access. The BFF is a transport/session boundary, not an authorization engine.

For a product access decision, NetHubKe must evaluate, server-side:
1. Validated token provenance and canonical issuer + subject mapping.
2. Canonical account active/blocked state.
3. Product/service existence, lifecycle state and global availability.
4. Whether authentication is required by the service policy.
5. Organization entitlement where required.
6. Individual grant where required.
7. A narrowly authorized administrative override, with reason, expiry and durable audit; it cannot bypass disabled identity or globally disabled service.
8. Product-specific claim profile and audience before token issuance.

The response must distinguish at least: allowed, authentication required, account disabled, service unavailable/disabled, not linked, organization entitlement missing, individual grant missing, and administrative/policy denial. Exact enum names and response schema are to be frozen after comparing existing service and entitlement implementations.

The website may hide or disable UI actions based on these responses, but UI visibility is never access control. Every sensitive BFF route and every NetHubKe operation must enforce authorization server-side.

## 7. Product launch and token handoff

A product JWT must never be returned to browser JavaScript or placed in a URL, query string, fragment, referrer, analytics event, or browser-visible redirect payload.

Target launch sequence:
1. Browser calls its own BFF launch route with a product slug.
2. BFF validates the authenticated session and asks NetHubKe to authorize the requested product.
3. NetHubKe evaluates current policy and creates a short-lived, single-use, audience-bound launch transaction/code associated with a registered redirect target.
4. BFF redirects the browser only to that registered target with an opaque, short-lived, single-use code. The code is not a product access token and must not reveal user claims.
5. The destination product's trusted backend/BFF redeems the code server-to-server with NetHubKe, authenticates its own client identity, and receives the audience-specific product JWT.
6. The product backend establishes its own secure session and redirects to a clean URL. The code is invalidated atomically and cannot be replayed.

Required protections: registered redirect allowlist, exact audience/product binding, very short expiry, one-time atomic redemption, replay detection, rate limiting, no open redirect, no token-in-URL, no sensitive logging, and audit events. If the existing N7 implementation does not provide this complete boundary, launch remains unavailable/flagged off. Do not invent a frontend-only token handoff.

## 8. Logout, expiry, refresh and revocation

- Local logout clears the BFF session and cookies.
- Federated logout is initiated server-side using the OIDC end-session metadata and a registered post-logout redirect URI. The browser may navigate to the configured OIDC provider to complete the IdP logout.
- Upstream access-token refresh is performed server-side only. Refresh-token rotation must replace the stored refresh token when returned.
- A refresh failure invalidates the authenticated BFF session; do not continue using expired credentials or silently fall back to IdP-only identity.
- Product JWT expiry is enforced by product APIs locally. Normal grant removal, account disable, organization entitlement revocation and service disable must meet the approved five-minute end-to-end stale-access bound.
- The five-minute target is not proven by setting a four-minute issuer TTL alone. Product verifier JWKS cache behavior, clock skew and emergency key invalidation must be included in measured tests.

## 9. Error contract

The NetHubKe API should return stable machine-readable error codes, with HTTP status semantics preserved. The BFF maps them to safe browser-facing errors.

| Condition | Suggested HTTP status | BFF behavior |
|---|---:|---|
| Missing/expired/invalid upstream authentication | 401 | Attempt valid refresh once where appropriate; otherwise clear session and require sign-in |
| Canonical identity not initialized/linked | 403 or documented 404 | Show account initialization/linking state; never create/link by email alone |
| Disabled identity | 403 | Deny and invalidate local application access state |
| Product/service disabled or unavailable | 403 or 404 per disclosure policy | Show unavailable state; no launch |
| Missing entitlement/grant | 403 | Show access-denied/subscription state; no launch |
| Exchange/launch feature disabled | 503 | Show temporarily unavailable; do not retry-loop |
| Invalid request | 400/422 | Show field-safe validation errors |
| Rate limited | 429 | Respect Retry-After |
| NetHubKe unavailable | 502/503 at BFF boundary | Show temporary service error; do not fabricate profile/access success |

Exact error-code strings, response envelope and correlation-ID behavior remain to be reconciled with existing FastAPI exception handlers before the contract is declared frozen.

## 10. Server-only implementation boundaries

For the existing Next.js application:
- `apps/frontend/src/lib/server/backend.ts` remains server-only; it must never be imported by client components.
- `BACKEND_URL` is server-only. Never rename/expose it as `NEXT_PUBLIC_BACKEND_URL`.
- All browser-to-backend traffic uses explicit Next.js Route Handlers or server actions. Client components call only same-origin application endpoints or server actions.
- The Auth.js public session callback must not return `accessToken`, `refreshToken`, `idToken`, product tokens, or raw OIDC claims not required by the UI.
- Keep generated API clients/types separated by runtime: browser-facing BFF DTOs are distinct from NetHubKe upstream API types. Do not generate a browser client pointed at NetHubKe's origin.
- BFF code validates and maps inputs/outputs; it is not a transparent proxy and must not forward arbitrary headers/cookies.
- Use `cache: "no-store"` for identity, entitlement, exchange and launch responses. Public catalogue caching may be considered separately.
- Keep secrets and OIDC configuration in server-only modules. Do not include them in client bundles or public runtime config.

## 11. Conformance requirements for every client

A client is conformant only when it can demonstrate:
- It authenticates using the approved client-class flow and never handles another client's credentials.
- It resolves canonical identity through NetHubKe and does not use email as a stable identity key.
- It obtains service access decisions from NetHubKe, not from hard-coded product lists or frontend role assumptions.
- It does not choose its own audience, subject, organization ID, roles, claims or entitlement.
- It handles disabled identity, disabled product, missing entitlement, invalid token, expiry, rate limiting and NetHubKe outage as denials/failures.
- It never leaks access/refresh/ID/product tokens to browser JavaScript, URLs, logs or analytics.
- Product resource servers validate NetHubKe JWTs locally using JWKS and enforce their own domain permissions.
- It does not require per-request NetHubKe introspection from product APIs.
- It respects the five-minute end-to-end revocation target only when that target has been demonstrated by tests against the actual verifier behavior.

## 12. Current implementation gaps to resolve before website integration

These are repository observations, not permission to change runtime behavior:
1. The existing Auth.js callback retains an IdP-only session when `/users/sync` fails. The reference-client contract requires an explicit uninitialized/degraded state and must not present that session as a fully initialized NetHubKe account.
2. OIDC authorization currently requests `openid profile email`; the accepted NetHubKe API audience must be explicitly requested/configured and verified in a real token.
3. Existing `/services/my-status` derives `trial` from tenant tier when no product link exists. This is not an authoritative entitlement decision and must not drive launch authorization.
4. Existing `/auth/exchange` exchanges an upstream IdP bearer for a product JWT and is controlled by the shared, global `PRODUCT_TOKEN_EXCHANGE_ENABLED` gate (default false). It must remain server-side and gated until N3–N5 acceptance and staging requirements are met. Product audiences come only from the Product registry; no Tawala-specific environment override exists.
5. The N7 launch transaction/redeem boundary must be verified before any browser redirect to a product is enabled.
6. Current BFF helper supports a server-side bearer-token request, but its use must be restricted to server modules and wrapped by typed, explicit BFF route handlers.
7. The exact API audience/scope contract and machine-client authentication/rotation contract need environment and implementation verification.

## 13. Delivery sequence and programme alignment

This contract is a documentation/planning deliverable and does not authorize skipping N0–N10:
- First reconcile the earliest incomplete milestone and its acceptance evidence. The architecture contract currently identifies N1 (#42–#43) as the earliest not-demonstrably-accepted milestone; closed issue status alone is not evidence.
- Complete this reusable client contract in parallel as architecture documentation, without enabling later runtime paths.
- Backend readiness and website BFF implementation must be scheduled against the existing N0–N10 dependencies. N6/N7 catalogue and launch work (#149) must not be treated as accepted until N1–N5 prerequisites are evidenced.
- N8–N10 (#150) remains later programme work.
- Each implementation chunk requires its own explicit scope, tests and acceptance evidence. PRs target `dev`; no merge or deployment without explicit approval.

## 14. Decisions required to freeze this contract

1. **BFF session storage:** accept Auth.js encrypted HttpOnly JWT session for the first website client, or require server-side session storage before integration?
2. **NetHubKe audience:** confirm the exact the configured OIDC provider project/API audience and required scopes used by the upstream access token.
3. **First-login failure policy:** should a user whose the configured OIDC provider login succeeds but NetHubKe identity sync fails be signed out, or remain in a restricted `identity_pending` session that can only retry initialization?
4. **Launch handoff:** approve the one-time launch-code redemption model as the standard browser-to-product handoff, subject to N7 implementation and security acceptance.
5. **Non-browser clients:** confirm that backend/machine clients authenticate directly server-to-server, while all browser clients are required to use their own BFF.

No runtime implementation, feature flag, schema, secret, or deployment setting is changed by this contract document.
