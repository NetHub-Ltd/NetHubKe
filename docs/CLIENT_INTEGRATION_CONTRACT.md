# NetHubKe Shared Client Integration Contract

**Status:** Backend contract — 2026-11-03  
**Programme:** #57  
**Identity provider:** Zitadel — https://auth.nethub.co.ke  
**Clients:** NetHubKe website, Tawala and NetPay  
**Scope:** Shared client-to-NetHubKe API authentication and authorization. Frontend implementation is out of scope.

## 1. One authentication mechanism

All three applications are clients of NetHubKe backend and use the same Zitadel identity provider.

- Each application has its own registered OIDC client configuration and approved redirect URI.
- Each application authenticates the user with Zitadel.
- Zitadel issues the access token.
- The client presents that access token to NetHubKe APIs.
- NetHubKe validates the same token contract and resolves the same canonical identity/policy model regardless of which client made the request.

NetHubKe does not perform browser login, issue client tokens, exchange tokens or maintain a second authentication session.

## 2. Client request contract

Protected API requests present a Zitadel-issued access token as a Bearer credential. It must be an access token intended for the NetHubKe API, not an ID token.

| Field | Requirement |
|---|---|
| Issuer | Exact configured Zitadel issuer |
| Audience | Shared NetHubKe API audience; distinct from each OIDC client ID |
| Signature | Valid against keys from trusted OIDC discovery/JWKS metadata |
| Algorithm | Explicit approved asymmetric allowlist |
| Time | Valid expiry and not-before; bounded clock tolerance |
| Subject | Required immutable IdP subject |
| Scope/permissions | Required API scopes for the requested operation |
| Canonical identity | Local mapping by exact issuer + subject |
| Account state | Canonical local account must be active and not deleted |

Client IDs distinguish registered OIDC clients; they do not create separate API audiences or separate authentication mechanisms. Do not add per-product token formats.

## 3. NetHubKe backend responsibilities

For each protected request, NetHubKe validates the IdP token, resolves the local user by issuer + subject, rejects unlinked/disabled/deleted users where appropriate, enforces scopes and resource authorization, resolves tenant context from the canonical user, evaluates NetHubKe-managed service entitlements and returns a typed resource DTO.

Email is profile data only. It is not a canonical identity key or an automatic account-linking mechanism.

## 4. Client classes and token custody

The backend contract is independent of frontend framework or token-storage implementation.

- A browser client redirects the user to Zitadel for authentication and protects tokens from exposure to untrusted browser code. A trusted server-side BFF is an appropriate custody boundary where the application uses one.
- A native client uses an appropriate public-client OIDC flow such as Authorization Code + PKCE and platform-protected token storage.
- A trusted backend/machine client uses a separately approved machine identity and scoped credentials only if that use case is required.

No client may embed a client secret or signing key in public code/configuration. The existing NetHubKe website BFF from PR #173 remains its current implementation; it does not create a different backend authentication protocol.

## 5. Current and required API resources

| Endpoint | Current/required behavior |
|---|---|
| POST /api/v1/users/sync | Existing: initialize canonical identity from a validated IdP access token; no email-only linking |
| GET /api/v1/users/me | Existing: return caller's canonical profile; requires user:read |
| PATCH /api/v1/users/me | Existing: update allowed own-profile fields; requires user:write |
| GET /api/v1/services/get-services | Existing public catalogue; not an entitlement decision |
| GET /api/v1/services/my-status | Existing connection/link status only; not authoritative product access |
| GET /api/v1/services/{slug}/access | Required: new read-only authoritative access decision for authenticated canonical user/tenant; reuse existing entitlement evaluator |
| GET /api/v1/users/me/product-links | Existing: read links scoped to caller's tenant |
| PUT /api/v1/users/me/product-links | Existing: sensitive owner/admin operation with validation and durable audit |
| GET /api/v1/billing/summary | Existing protected read of caller's tenant billing data |

The access-decision endpoint must not trust caller-supplied user ID, tenant ID, role, entitlement or organization ID. Its minimal response identifies the service and returns an explicit allow/deny result with a stable reason code. Do not expose internal policy data unnecessarily.

## 6. Connection status is not entitlement

The existing services/my-status endpoint derives trial from tenant tier and connected from a product link. Those are connection/presentation signals, not authorization.

The new access-decision endpoint reuses the existing entitlement evaluator and enforces product/service active state, organization subscription validity, individual membership grants, configured policy mode and valid unrevoked time-bound overrides. Do not duplicate this policy in route handlers, clients or frontend code.

## 7. Error behavior

- Missing, malformed, expired or invalid bearer: 401.
- Valid token but missing canonical identity: documented initialization response; do not silently create/link by email on protected reads.
- Disabled/deleted local account: 403.
- Missing scope: 403.
- Unknown or inactive service: 404/403 according to disclosure policy.
- Missing entitlement: 403 with a stable machine-readable reason.
- IdP discovery/JWKS unavailable: fail closed with service-unavailable response.
- Database unavailable: protected resource access fails closed.

Exact error codes follow existing FastAPI response conventions and are frozen with tests.

## 8. Five-minute access freshness

The five-minute maximum stale-access target applies to the full path, not independently to each cache.

NetHubKe currently checks canonical account state and entitlement data against PostgreSQL during protected requests. Remaining evidence is actual Zitadel access-token lifetime, IdP-side disablement behavior, JWKS refresh/rotation and configured clock tolerance. Do not claim compliance based on the former product-token TTL.

## 9. Product-token subsystem

The existing exchange, JWKS and signing-key operations belong to a previous product-token design. They are not required for clients to access NetHubKe APIs.

- Keep exchange disabled.
- Do not use NetHubKe-issued product JWTs as NetHubKe API bearer credentials.
- Audit actual deployed product consumers before deleting the legacy subsystem.
- If no separately approved product-API use exists, remove exchange/JWKS/key management and its schema/configuration as one coherent cleanup.
- No launch-code, redemption or second token exchange is part of this contract.

## 10. Acceptance for each client

The website, Tawala and NetPay must pass the same backend conformance cases: valid access token for the shared API audience; ID token/client-audience token rejected; wrong issuer/audience, invalid signature, expired/not-yet-valid token rejected; missing scope denied; unlinked/disabled/deleted canonical user denied where appropriate; cross-tenant access denied; service access allowed/denied using the same evaluator; public catalogue remains public and does not imply entitlement.

Tests vary the registered OIDC client identity while retaining the same API audience and backend contract. No frontend redesign is included.
