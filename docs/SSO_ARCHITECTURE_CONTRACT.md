# NetHubKe Identity & Access Architecture

**Status:** Approved architecture baseline — 2026-11-03  
**Programme:** #57  
**Identity provider:** Zitadel — https://auth.nethub.co.ke  
**Clients:** NetHubKe website, Tawala and NetPay

## 1. Responsibility boundaries

- **Zitadel:** sole identity provider. Owns authentication, MFA, login/logout, OIDC authorization flows, sessions, signing keys, access/refresh/ID token issuance and token lifecycle.
- **NetHubKe backend:** protected resource server and centralized authorization/resource API. Validates Zitadel-issued access tokens, resolves canonical identity, evaluates NetHubKe-managed access and returns authorized resources.
- **NetHubKe website, Tawala and NetPay:** clients of the same backend. Each uses its own registered OIDC client configuration with Zitadel and presents a Zitadel-issued access token to NetHubKe.
- **Product applications:** retain authorization over their own domain data and actions. NetHubKe does not replace product-owned business roles or resource permissions.
- **PostgreSQL:** durable source of truth. **Redis:** disposable cache/coordination only.

NetHubKe is not an IdP, OAuth authorization server, password store, token broker or second token issuer.

## 2. Shared client access contract

1. A client authenticates with Zitadel using its registered OIDC client.
2. Zitadel issues an access token intended for the NetHubKe API.
3. The client presents that token as a bearer credential when calling NetHubKe.
4. NetHubKe validates signature, approved algorithm, exact issuer, API audience, expiry/not-before and required identity/scope claims using trusted OIDC discovery/JWKS.
5. NetHubKe resolves the canonical user using the exact issuer + subject pair.
6. NetHubKe checks canonical account state, required scopes, tenant context and service entitlement before returning protected resources.

All three clients use the same API audience and backend validation path. Client IDs and redirect URIs identify OIDC clients; they are not substitutes for the API audience. Client-specific policy is added only where a concrete authorization requirement exists.

ID tokens are not API credentials. The API audience must be configured so a client ID token is rejected by audience validation.

## 3. Canonical identity and lifecycle

- Canonical identity is the exact pair (issuer, immutable subject).
- Email is mutable profile data and never an identity key.
- First-login sync initializes a local identity only from a validated access token.
- A matching email without an existing identity mapping requires explicit, separately verified account linking.
- Disabled or deleted local accounts are denied even if the upstream access token remains cryptographically valid.
- Profile email changes are accepted only under the existing verified-email rules.

## 4. Central service-access policy

NetHubKe owns ecosystem-level service registry and entitlement decisions. The existing evaluator supports organization subscriptions, individual membership grants, time-bound overrides and product/service lifecycle checks.

A client must receive an authoritative access decision from NetHubKe. Connection/link status or a frontend plan heuristic is not an entitlement decision.

Policy evaluation validates the IdP token and canonical identity, denies disabled users and inactive services, evaluates the configured organization/individual entitlement policy, and applies only explicit, authorized, time-bound overrides with durable audit. Reuse the existing evaluator; do not create a second policy engine.

## 5. Revocation and freshness

The approved target remains a maximum five-minute stale-access window for normal account/service/entitlement changes.

Current backend facts:
- Canonical user state is checked against PostgreSQL on authenticated requests.
- Entitlement evaluation reads PostgreSQL and does not use an entitlement cache.
- OIDC discovery and JWKS caches are each bounded at 300 seconds.
- JWT validation applies 10 seconds of clock leeway.

These settings alone do not prove end-to-end compliance. Actual Zitadel access-token lifetime, IdP-side account-disable behavior, JWKS refresh/rotation and clock tolerance must be measured against the configured tenant.

## 6. Product-token issuer status

The repository retains a default-off product-token exchange/signing/JWKS subsystem from the previous architecture. It is not part of the shared client-to-NetHubKe API contract.

- Keep PRODUCT_TOKEN_EXCHANGE_ENABLED=false.
- Do not use product tokens as credentials for NetHubKe API requests.
- Audit actual Tawala/NetPay and external consumers before removal.
- If no separately approved product-API use exists, remove exchange, JWKS, signing-key operations, related configuration and schema together.
- Do not add launch-code redemption or another exchange protocol.

## 7. Administration and product authorization

NetHubKe remains the control plane for its service registry, service lifecycle, entitlement grants and overrides. Administrative routes enforce least privilege and durable audit. Product-specific roles, staff permissions and domain-level data access remain product-owned.

## 8. Explicit non-goals

- NetHubKe login UI, password storage or IdP functionality.
- NetHubKe OAuth/OIDC authorization-server endpoints or token minting.
- NetHubKe product JWTs as credentials for calls to NetHubKe APIs.
- Launch codes, second exchanges or product-specific authentication variants.
- Replacing product-owned authorization.
- Frontend redesign as part of backend implementation.
- Per-request introspection where the shared access-token contract and bounded policy checks are sufficient.

No production deployment or feature-flag enablement is implied.
