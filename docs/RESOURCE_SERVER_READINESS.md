# NetHubKe Resource Server Readiness Checklist

> **Purpose:** A testable, evidence-backed definition of production readiness for NetHubKe as the shared, IdP-agnostic Resource Server and central subscription/entitlement authority for NetHub products.
>
> **Status:** Readiness standard and implementation checklist. Unchecked items are not claims that the capability is absent; they require repository inspection, implementation, or operational evidence before being marked complete.
>
> **Architecture contract:** NetHubKe accepts access tokens issued by a separately operated Identity Provider. It validates those tokens, resolves principals, makes and enforces authorization decisions, protects NetHub-managed resources, and owns subscription and entitlement state. It does not authenticate users, operate an Authorization Server, or mint/exchange product access tokens.

---

## 1. How to use this checklist

- [ ] Assign an owner and evidence link to every completed section.
- [ ] Mark an item complete only when implementation, automated tests, and (where applicable) operational evidence exist.
- [ ] Use **N/A** only with a short rationale and reviewer approval.
- [ ] Record gaps as issues with acceptance criteria; do not silently waive security controls.
- [ ] Keep this checklist current as the architecture and threat model evolve.

### Completion states

| State | Meaning |
|---|---|
| [ ] Not verified | No sufficient evidence yet; this is the default |
| [x] Verified | Implementation and required evidence have been reviewed |
| N/A | Not applicable, with a documented reason |

### Readiness gates

| Gate | Required outcome |
|---|---|
| G0 — Architecture | Boundaries, trust model, threat model, and ownership are explicit |
| G1 — Identity and token security | Invalid, misdirected, expired, or untrusted tokens cannot access protected resources |
| G2 — Authorization and tenancy | Every protected operation is authorized in resource and organization context |
| G3 — Subscription and entitlements | Subscription lifecycle and product capabilities are centrally and consistently evaluated |
| G4 — Data and API security | Data isolation, validation, error handling, and abuse controls are verified |
| G5 — Operations | Deployment, observability, recovery, and incident procedures are usable |
| G6 — Production acceptance | Automated and staging evidence demonstrates the end-to-end security contract |

A production release must not be declared ready while any **critical** item is unverified. Risk acceptance must be explicit, time-bound, and approved by the designated owner; it must never be used to waive a known tenant-isolation or token-validation defect.

---

## 2. Architecture and responsibility boundaries

### Resource Server contract

- [ ] NetHubKe is documented and implemented as an OAuth 2.0 Resource Server, not an Authorization Server or Identity Provider.
- [ ] The configured external IdP is the authority for user authentication and token issuance.
- [ ] NetHubKe does not issue product JWTs, exchange tokens, maintain signing keys for product tokens, or create a parallel login/password system.
- [ ] All clients (corporate website/BFF, Tawala, NetPay, and future applications) use one documented integration protocol.
- [ ] Authentication, principal resolution, authorization, resource access, subscription management, and entitlement evaluation have explicit module boundaries.
- [ ] Subscription and entitlement management are explicitly in scope for NetHubKe; historical milestone notes that defer billing/entitlements are superseded by this contract.
- [ ] Products own their domain workflows and product data; NetHubKe owns shared identity, organization, application/client registration, subscription, and entitlement records as defined by the domain model.
- [ ] No product-specific boolean configuration flags or product-specific authentication paths are introduced as substitutes for generic grants, capabilities, and policies.
- [ ] Trust assumptions, data flows, security boundaries, and external dependencies are documented.
- [ ] A threat model covers token theft/replay, confused deputy, privilege escalation, cross-tenant access, client compromise, webhook forgery, billing abuse, and denial of service.

### Explicit non-responsibilities

- [ ] User login, password storage/reset, MFA, and identity proofing remain with the IdP.
- [ ] OAuth authorization endpoints, consent screens, authorization-code issuance, refresh-token issuance, and token signing remain with the Authorization Server.
- [ ] Product-specific business rules and product-owned records remain in their respective products.
- [ ] Payment providers process payments; NetHubKe records and reconciles their verified outcomes but does not trust browser claims of payment success.

---

## 3. Token validation and principal security — critical

Use current OAuth/OIDC security guidance, including RFC 6750 (Bearer Token Usage), RFC 8725 (JWT Best Current Practices), RFC 9068 where JWT access-token profiles are adopted, and RFC 9700 (OAuth 2.0 Security Best Current Practice). The implementation must follow the token format and contract actually agreed with the configured IdP; do not assume that every OIDC ID token is an API access token.

### Cryptographic and claim validation

- [ ] Accept bearer access tokens only over TLS in deployed environments.
- [ ] Reject missing, malformed, duplicated, unsupported, or ambiguous Authorization credentials.
- [ ] Verify the JWT signature using keys obtained from the configured trusted issuer's JWKS endpoint.
- [ ] Restrict accepted signing algorithms to an explicit allowlist; reject `none`, algorithm confusion, and unexpected key types.
- [ ] Validate exact configured issuer (`iss`); issuer normalization is deliberate, tested, and does not permit lookalike issuers.
- [ ] Validate the intended API audience (`aud`) against a configured NetHubKe resource identifier.
- [ ] Validate expiry (`exp`) and not-before (`nbf`); require the claims mandated by the selected access-token profile.
- [ ] Validate issued-at (`iat`) and token age where the adopted profile/policy requires it.
- [ ] Validate token type/profile and distinguish access tokens from ID tokens and other JWTs.
- [ ] Validate subject (`sub`) as a non-empty opaque string; never coerce it to a numeric identifier.
- [ ] Validate authorized party/client identity (`azp`/client identifier) according to the IdP's documented token contract.
- [ ] Treat scopes and roles as untrusted claims until signature and all relevant claims are validated.
- [ ] Enforce required scopes/permissions for the route and operation; parsing scopes without enforcing them is insufficient.
- [ ] Reject tokens with unsupported critical headers, invalid key identifiers, or ambiguous claims.
- [ ] Ensure key rotation works without downtime; unknown `kid` triggers a bounded, safe JWKS refresh.
- [ ] Bound JWKS network timeouts, response size, cache lifetime, and refresh frequency.
- [ ] Fail closed when signature validation or required trust metadata cannot be established.
- [ ] Do not silently fall back to unverified claims, unsigned tokens, or a permissive development path in production.

### Issuer and client trust

- [ ] Trusted issuer configuration is explicit and environment-specific.
- [ ] API audience validation is separate from OIDC client registration/trust checks; a client ID is not a substitute for the API audience.
- [ ] Client registration has a documented model, lifecycle, status, and administrative ownership.
- [ ] Only explicitly registered and active clients may call the API, where client allowlisting is part of the platform trust policy.
- [ ] Client identity is derived from a documented, validated claim; precedence between `azp`, `client_id`, and `aud` is explicit and tested.
- [ ] A multi-valued audience is handled correctly; the API's resource audience must be present rather than accepting any arbitrary audience/client identifier.
- [ ] Revoked or disabled clients are denied within a documented and tested propagation bound.
- [ ] Bootstrap environment variables are limited to controlled initial setup and do not silently override database-managed trust state.
- [ ] Public clients are not required to possess a client secret; confidential-client authentication is handled only where the protocol requires it.
- [ ] Tokens issued for another API, a frontend session, or a different client cannot be replayed as NetHubKe access tokens.

### Principal resolution

- [ ] A validated token is converted into a small internal principal model with issuer, subject, client identity, scopes, and explicitly supported claims.
- [ ] Local user identity is keyed by the stable pair `(issuer, subject)`, never email alone.
- [ ] Email and display-name claims are treated as profile attributes, not immutable identity keys.
- [ ] Identity linking requires a verified, explicit workflow and prevents accidental account takeover through email collisions.
- [ ] User deactivation, suspension, or deletion policy is enforced independently of the token's validity.
- [ ] User sync is idempotent and cannot silently reactivate a disabled account.
- [ ] Service principals and human principals are distinguishable; service calls do not masquerade as end users.
- [ ] Delegated user context records both the human actor and calling client/service.
- [ ] Missing or inconsistent principal records produce safe, deterministic failures.

### Token lifecycle and revocation

- [ ] Access-token lifetime and accepted clock skew are documented and bounded.
- [ ] Logout, user disablement, client revocation, and emergency compromise response have documented semantics.
- [ ] The system explicitly documents that self-contained JWT validation does not automatically provide immediate token revocation.
- [ ] Any denylist, introspection, session/version check, or cache strategy has a defined freshness and availability policy.
- [ ] Security-sensitive revocations (user disablement, client revocation, organization suspension) take effect within an agreed maximum propagation window.
- [ ] JWKS and authorization caches cannot extend trust beyond their configured bounds.
- [ ] Bearer tokens are never written to application logs, traces, analytics, exception messages, or audit payloads.

---

## 4. Authorization and policy enforcement — critical

### Authorization model

- [ ] The authorization model is documented and consistent (for example, RBAC for role assignment plus resource/attribute checks for contextual decisions).
- [ ] Authentication and authorization are separate code paths and test concerns.
- [ ] Every protected endpoint has an explicit policy; no route is protected merely because it happens to depend on a user lookup.
- [ ] Policies consider principal, action, resource, organization/tenant, calling client, and applicable entitlement context.
- [ ] Authorization is deny-by-default; missing policy, missing context, and policy evaluation errors do not grant access.
- [ ] Permissions are granular enough to distinguish read, create, update, delete, administer, and sensitive actions.
- [ ] Roles are scoped to an organization or resource where appropriate; a global role is never inferred from an organization role.
- [ ] Role assignment and privilege changes are restricted to authorized administrators and audited.
- [ ] User-supplied role, tenant, organization, owner, or privilege fields are never trusted as authorization facts.
- [ ] Scope/role claims from tokens are mapped through a documented policy; arbitrary claim names do not automatically become permissions.
- [ ] Authorization checks occur at the service/domain boundary as well as at the HTTP route boundary where operations can be invoked internally.
- [ ] List, search, export, aggregate, nested-resource, and bulk endpoints apply the same access policy as single-resource reads.
- [ ] Object-level authorization prevents IDOR/BOLA; knowing or guessing a UUID is never sufficient for access.
- [ ] Sensitive operations support step-up/re-authentication or additional approval where risk warrants it.

### Organization and tenant isolation

- [ ] Organization membership is modeled explicitly, including status, role/grants, and lifecycle.
- [ ] A user may belong to multiple organizations without a global default membership being assumed.
- [ ] The active organization context is resolved from trusted server-side state or validated request context and checked against membership.
- [ ] A client cannot switch organization context by changing a header, query parameter, or request body without authorization.
- [ ] Every organization-owned record has an enforceable organization boundary.
- [ ] Database queries are scoped by authorized organization context; filtering only in the frontend is not accepted.
- [ ] Cross-tenant foreign-key references and nested relationships are validated.
- [ ] Tenant context cannot be confused between concurrent requests or reused from pooled sessions.
- [ ] Background jobs, scheduled tasks, exports, and administrative tools carry explicit tenant context.
- [ ] Cross-tenant administrative access is a separate, narrowly granted, audited capability.
- [ ] Tenant isolation is tested with at least two organizations and users with different membership levels.
- [ ] Where PostgreSQL row-level security is used, policies, session context, connection pooling behavior, migrations, and bypass roles are tested. RLS is defense in depth, not a substitute for application authorization.

### Administrative access

- [ ] Administrative privileges are granted through controlled provisioning, not mutable self-service profile fields.
- [ ] Bootstrap administrator configuration is restricted, auditable, and removable after initial setup.
- [ ] Administrative APIs require explicit permissions beyond ordinary authenticated access.
- [ ] High-impact actions require confirmation or additional controls where appropriate.
- [ ] Admin access is attributable to a named human principal; shared admin accounts are avoided.
- [ ] Break-glass access is time-bound, monitored, and reviewed.
- [ ] Admins cannot bypass tenant boundaries without an explicit privileged policy.

---

## 5. Organization, application, and integration resources

- [ ] User profiles expose only approved fields and prevent clients from modifying server-controlled attributes.
- [ ] Organization creation, updates, suspension, and closure have defined authorization and lifecycle rules.
- [ ] Membership invitations, acceptance, removal, role changes, and ownership transfer are protected against replay and privilege escalation.
- [ ] Application/client registration has unique identifiers, ownership, status, allowed redirect/origin policy where relevant, and audit history.
- [ ] Client registration and client revocation are administrative operations, not public self-service endpoints.
- [ ] Client credentials, if any, are stored hashed or encrypted according to their use and are never returned after creation.
- [ ] Integration configuration is isolated by organization and application.
- [ ] Secrets are encrypted at rest with managed key material, access is restricted, and rotation/revocation is supported.
- [ ] Secret reads are minimized; APIs return masked metadata rather than secret values.
- [ ] Resource ownership and relationships are validated on create, update, and delete.
- [ ] API responses do not disclose internal database IDs, sensitive claims, secret metadata, or unrelated tenant information unnecessarily.

---

## 6. Central subscription management — NetHubKe owns this domain

**Decision:** NetHubKe is the central commercial authority for subscriptions across NetHub products. Subscriptions are not implemented independently in Tawala, NetPay, or the corporate website.

### Domain ownership and model

- [ ] Subscription management is a first-class domain/module in NetHubKe.
- [ ] Subscription records associate an organization/customer with a product and a plan; they are not implicitly tied to an individual user.
- [ ] The model supports an organization having subscriptions to multiple products.
- [ ] The model defines whether multiple concurrent subscriptions per organization/product are allowed and enforces that invariant.
- [ ] Plans, plan versions, prices, billing intervals, currency, trial policy, limits, and included capabilities have explicit models.
- [ ] Plan changes do not retroactively mutate historical invoices, payments, or subscription terms.
- [ ] Subscription status values and allowed transitions are explicitly defined (for example: pending, trialing, active, past_due, suspended, canceled, expired); exact states must match the business lifecycle.
- [ ] Status transitions are validated by the domain layer; clients cannot PATCH arbitrary status values.
- [ ] Start, renewal, current-period end, trial end, cancellation effective date, and grace-period dates use timezone-aware timestamps and consistent UTC storage.
- [ ] The system distinguishes cancel-at-period-end from immediate cancellation.
- [ ] The system defines treatment of paused, suspended, delinquent, refunded, disputed, and partially paid subscriptions.
- [ ] Subscription history is retained as an auditable lifecycle, not overwritten without trace.
- [ ] Manual comping, discounts, trials, and overrides require reason, actor, scope, and expiry where applicable.

### Billing and payment integrity

- [ ] Payment provider integrations are server-to-server and use provider-specific verification.
- [ ] Browser redirects, screenshots, client callbacks, or user-submitted transaction references are never sufficient proof of payment.
- [ ] Payment webhooks verify provider signatures/authenticity and reject forged or malformed events.
- [ ] Webhook processing is idempotent using provider event/transaction identifiers.
- [ ] Duplicate, delayed, reordered, and retried webhook events cannot duplicate charges, extend periods twice, or reactivate canceled subscriptions incorrectly.
- [ ] Payment intent/order, provider transaction, payment attempt, refund, chargeback, and reconciliation states are modeled distinctly where needed.
- [ ] Amount, currency, merchant/account, reference, and subscription/customer association are checked against server-side expectations.
- [ ] A payment is not considered settled solely because an initiation request succeeded.
- [ ] Payment status is reconciled against provider records through a retryable process.
- [ ] Failed, pending, reversed, refunded, and disputed payments have deterministic subscription effects.
- [ ] Financial records are append-only or have an auditable correction mechanism; financial history is not silently rewritten.
- [ ] No cardholder data or provider secrets are stored unless explicitly required and the applicable compliance scope is met.
- [ ] Payment provider credentials are isolated by environment and stored in a secret manager.

### Subscription lifecycle and automation

- [ ] Activation follows a verified business event (for example, confirmed payment, approved trial, or authorized manual grant).
- [ ] Renewal is idempotent and cannot extend the same billing period more than once.
- [ ] Expiration is enforced even if a scheduled job is delayed; request-time evaluation checks effective dates.
- [ ] Grace-period policy is explicit, bounded, and consistently applied.
- [ ] Cancellation, suspension, reactivation, upgrade, downgrade, and plan changes have tested transition rules.
- [ ] Proration/refund behavior is explicit; if not supported initially, the API and policy state that clearly.
- [ ] Scheduled lifecycle work is retryable, observable, and safe under duplicate execution.
- [ ] Missed jobs are recoverable after downtime without skipping or duplicating transitions.
- [ ] Subscription notifications are emitted from committed domain events and are not the source of truth.
- [ ] Manual support actions are recorded with actor, reason, timestamp, before/after state, and correlation ID.

### Subscription API and access effects

- [ ] Clients can read only subscription information they are authorized to see for their organization/product.
- [ ] Product clients cannot create or modify subscriptions by submitting arbitrary plan/status/price fields.
- [ ] Subscription management endpoints require dedicated permissions and organization context.
- [ ] Subscription state and entitlement state are separate concepts and separate contracts.
- [ ] An active subscription does not automatically grant every capability; plan rules and overrides determine entitlements.
- [ ] A canceled, expired, suspended, or past-due subscription has a documented capability effect, including any grace period.
- [ ] Read-only or data-export access after expiry is explicitly decided rather than accidental.
- [ ] Subscription changes trigger entitlement recalculation and reliable propagation.
- [ ] A product can query current subscription/entitlement state without receiving payment secrets or unnecessary billing data.

---

## 7. Entitlement and product capability management

- [ ] Entitlements are a first-class domain and the authoritative output of plan, subscription, grant, and policy evaluation.
- [ ] Capabilities use stable, namespaced identifiers (for example, `inventory.manage`, `reports.view`, `mpesa.accept`) rather than per-product boolean environment flags.
- [ ] Entitlement definitions include product, capability, description, value type, and validation rules.
- [ ] The model supports boolean capabilities, numeric quotas/limits, and enumerated options where required.
- [ ] Entitlement resolution considers plan version, subscription state, billing period, trial/grace policy, organization, product, add-ons, promotions, and explicit overrides.
- [ ] Explicit grants and overrides have an owner, reason, effective dates, expiry, and audit record.
- [ ] Precedence between plan defaults, add-ons, organization overrides, trial grants, and emergency suspension is documented and deterministic.
- [ ] Limits define units, reset periods, and whether enforcement is hard or soft.
- [ ] Usage metering is authoritative, deduplicated, and protected against concurrent over-consumption where quotas are billable.
- [ ] Entitlement evaluation is deterministic and testable with fixed input state.
- [ ] Entitlement snapshots/projections include version or updated-at metadata and can be rebuilt from authoritative records.
- [ ] Cache TTL and invalidation strategy have explicit maximum stale windows, especially for revocation and suspension.
- [ ] Products fail safely when entitlement state is unavailable; any grace/fallback behavior is explicit and bounded.
- [ ] Entitlement APIs expose only the capabilities for the requested organization and product.
- [ ] Product-specific enforcement remains in product code; central entitlements describe grants and limits, not every product workflow.
- [ ] A capability removed from a plan or organization takes effect within the agreed propagation bound.
- [ ] Entitlement changes are auditable and observable.

---

## 8. Service-to-service and delegated access

- [ ] Human users and machine/service principals are modeled separately.
- [ ] Every registered service has a stable identity and explicit lifecycle.
- [ ] Service tokens are audience-restricted to the intended API/resource.
- [ ] Service credentials use an appropriate standard flow (for example, OAuth client credentials or workload identity); no bespoke token minting is introduced in NetHubKe.
- [ ] Each service receives least-privilege scopes/grants; registration does not imply universal product access.
- [ ] Tawala cannot access NetPay resources merely because both are NetHub products, and vice versa.
- [ ] Delegated access records the human subject, calling client, requested action, and organization context.
- [ ] Service-to-service calls do not trust caller-supplied user IDs or organization IDs without policy validation.
- [ ] Credential rotation, compromise response, and revocation are documented and tested.
- [ ] Internal service calls are authenticated and authorized even when network traffic is private.
- [ ] mTLS or equivalent workload identity is evaluated for high-trust internal paths where justified by the deployment environment.

---

## 9. API and application security

- [ ] All non-public routes require authentication and explicit authorization.
- [ ] Public endpoints are deliberately allowlisted and documented.
- [ ] Request schemas reject unexpected fields where mass assignment could affect security.
- [ ] Input validation covers lengths, formats, enum values, nested objects, and boundary conditions.
- [ ] Pagination has bounded limits and stable ordering.
- [ ] Filtering, sorting, and search fields are allowlisted to prevent query abuse.
- [ ] Rate limits are applied by appropriate dimensions (IP, principal, client, organization, and expensive operation) without allowing one tenant to exhaust shared capacity.
- [ ] Sensitive endpoints have stricter limits and abuse monitoring.
- [ ] CORS is an explicit browser-origin policy, not an authentication mechanism.
- [ ] CSRF protections are applied to cookie-authenticated BFF/session endpoints where relevant; bearer-token API semantics are documented separately.
- [ ] Security headers and TLS policy are configured at the appropriate edge/application layer.
- [ ] Errors use consistent safe response shapes and do not reveal stack traces, SQL, secrets, or internal topology.
- [ ] 401, 403, 404, 409, 422, and 429 semantics are consistent and do not disclose resource existence across tenants.
- [ ] Request IDs/correlation IDs are generated or validated safely and propagated across services.
- [ ] API versioning and backward-compatibility rules are documented.
- [ ] OpenAPI accurately describes authentication schemes, scopes, error responses, and request/response schemas.
- [ ] Generated API documentation does not expose internal-only routes or secrets.
- [ ] File upload, export, and webhook endpoints have size/type validation, malware/content controls where applicable, and safe storage policies.
- [ ] SSRF, unsafe redirects, path traversal, SQL injection, command injection, and deserialization risks are considered for relevant endpoints.

---

## 10. Data protection, privacy, and database integrity

- [ ] Data classification identifies public, internal, confidential, personal, credential, and financial data.
- [ ] Only necessary personal data is collected and returned.
- [ ] Data retention, deletion, correction, and export policies are documented, including legal/financial retention constraints.
- [ ] Sensitive data is encrypted in transit and at rest.
- [ ] Secrets and high-risk fields use managed encryption keys with rotation and restricted access.
- [ ] Database roles follow least privilege; application runtime does not use schema-owner/superuser credentials.
- [ ] Migrations are reviewed, reversible where practical, and tested against PostgreSQL.
- [ ] Foreign keys, unique constraints, check constraints, and indexes enforce important invariants.
- [ ] Identity uniqueness on `(issuer, subject)` is enforced by the database.
- [ ] Subscription/payment/webhook idempotency keys have database-backed uniqueness constraints.
- [ ] Financial and audit history has append-only or tamper-evident controls appropriate to risk.
- [ ] Transactions protect multi-record operations such as payment settlement plus subscription activation.
- [ ] Concurrency tests cover renewal, duplicate webhook delivery, plan changes, membership updates, and quota consumption.
- [ ] Database connection pooling does not leak tenant or authorization context between requests.
- [ ] Backups are encrypted, access-controlled, monitored, and stored separately from the primary database.
- [ ] Restore tests demonstrate recovery to documented RPO/RTO targets.
- [ ] Production data is not copied into development/test environments without approved sanitization.

---

## 11. Audit, logging, monitoring, and detection

- [ ] Security events include authentication failures, authorization denials, client changes, role/grant changes, membership changes, subscription transitions, entitlement overrides, payment events, and privileged actions.
- [ ] Audit events identify actor, actor type, client/service, organization, action, target resource, outcome, timestamp, and correlation ID where applicable.
- [ ] Audit records are protected from ordinary application-user modification and have a defined retention policy.
- [ ] Logs exclude bearer tokens, cookies, passwords, secrets, payment credentials, and unnecessary personal data.
- [ ] Authentication and authorization denials are observable without logging credential material.
- [ ] Metrics cover request volume/latency/errors, token validation failures, JWKS availability/cache behavior, authorization denials, tenant-level throttling, webhook outcomes, subscription transitions, and entitlement propagation.
- [ ] Alerts exist for unusual auth failures, privilege changes, client revocation, webhook failures/backlogs, reconciliation drift, and repeated cross-tenant denial patterns.
- [ ] Logs, metrics, and traces use consistent correlation identifiers.
- [ ] Health and readiness probes do not expose internal secrets or sensitive infrastructure details.
- [ ] Diagnostics endpoints are disabled or access-controlled in production and return only the minimum operational detail.
- [ ] Monitoring and alert delivery are tested, not merely configured.

---

## 12. Reliability, performance, and resilience

- [ ] The API has documented availability, latency, and recovery objectives.
- [ ] Timeouts are configured for database, JWKS, payment-provider, and other external calls.
- [ ] External dependency failures produce bounded, safe behavior and do not create authorization fail-open paths.
- [ ] JWKS cache and entitlement cache behavior is tested during dependency outages.
- [ ] Retries use bounded exponential backoff and jitter and are limited to safe/idempotent operations.
- [ ] Background tasks are durable or recoverable; in-process fire-and-forget work is not used for financial or subscription-critical processing.
- [ ] Database pool sizes and concurrency limits are appropriate for the deployment resource budget.
- [ ] Slow queries and high-cardinality queries are monitored.
- [ ] Rate limiting and backpressure protect shared infrastructure.
- [ ] Load tests cover expected concurrent users, organizations, token validation, and entitlement lookups.
- [ ] Failure tests cover database outage, IdP/JWKS outage, payment-provider outage, delayed webhooks, and worker downtime.
- [ ] Graceful shutdown drains requests and does not lose committed or queued work.
- [ ] Readiness indicates whether the instance can safely serve requests; liveness remains independent of transient downstream failures where appropriate.

---

## 13. Testing and security verification

### Automated test baseline

- [ ] Unit tests cover token parsing, claim validation, principal resolution, authorization policy, subscription transitions, entitlement calculation, and idempotency helpers.
- [ ] Cryptographic token tests use fixed test keys and cover valid and invalid signatures.
- [ ] Negative token tests cover wrong issuer, wrong audience, expired/not-yet-valid tokens, missing subject, unsupported algorithm, malformed token, wrong token type, unknown key ID, and key rotation.
- [ ] Client trust tests cover active, inactive, unknown, and revoked clients and multi-valued audience behavior.
- [ ] Route tests prove every protected route rejects missing/invalid credentials.
- [ ] Authorization tests cover allow and deny cases for every permission and resource ownership boundary.
- [ ] Multi-tenant tests prove user A cannot read, modify, list, export, or infer user B's organization resources without explicit grants.
- [ ] Service tests prove one product service cannot access another product's resources without explicit authorization.
- [ ] Admin tests cover privilege escalation, bootstrap controls, break-glass access, and audit events.
- [ ] Subscription tests cover every permitted and forbidden state transition.
- [ ] Payment/webhook tests cover invalid signatures, duplicate delivery, retries, out-of-order events, amount/currency mismatch, refunds, reversals, and reconciliation.
- [ ] Entitlement tests cover plan versions, add-ons, overrides, expiry, grace periods, suspension, quotas, and propagation.
- [ ] Database tests run against PostgreSQL, not SQLite as a substitute for production semantics.
- [ ] Alembic upgrade/downgrade and migration-from-current-schema tests run in CI.
- [ ] Concurrency tests cover duplicate payment events, renewal races, quota races, and concurrent membership/role changes.
- [ ] Contract tests verify the integration behavior expected by the website/BFF, Tawala, and NetPay.
- [ ] Tests assert that no NetHubKe-issued access token or refresh token is returned.
- [ ] CI runs lint/type checks, tests, migration checks, and production build/package validation.
- [ ] Coverage is measured for security-critical modules; coverage percentage alone is not treated as proof.

### Security assurance

- [ ] Dependency and container image scanning run in CI.
- [ ] Static analysis and secret scanning are enabled.
- [ ] A threat-led security review is completed before production exposure.
- [ ] OWASP API Security Top 10 risks, especially BOLA, broken authentication, broken function-level authorization, and unrestricted resource consumption, are assessed.
- [ ] Penetration testing or an equivalent independent security assessment covers the externally reachable API before high-risk production use.
- [ ] Findings are triaged by severity, assigned, fixed, and retested.
- [ ] Security regression tests are added for every confirmed vulnerability.

---

## 14. Deployment, configuration, and operational readiness

- [ ] Environments (development, staging, production) are isolated, with distinct issuers/clients, databases, payment credentials, and secrets.
- [ ] Configuration is validated at startup; invalid production configuration prevents serving traffic.
- [ ] Secrets are injected from a secret manager and never committed to the repository or exposed in frontend bundles.
- [ ] Production debug mode and unsafe diagnostics are disabled.
- [ ] TLS termination, trusted proxy configuration, forwarded-header handling, and host validation are explicit.
- [ ] Database migrations run as a controlled deployment step, not concurrently from every application replica.
- [ ] Deployment is repeatable and uses immutable, traceable artifacts.
- [ ] Rollback and forward-fix procedures account for schema compatibility and irreversible financial events.
- [ ] CI status checks required for protected branches are green.
- [ ] Staging mirrors production-relevant security configuration without using production secrets or personal data.
- [ ] Configuration changes, issuer changes, JWKS changes, and client trust changes have review and rollback procedures.
- [ ] Capacity, resource limits, autoscaling/replica behavior, and database pool limits are documented.
- [ ] Dependency and IdP outage runbooks exist.
- [ ] Backup restoration and disaster recovery are exercised on a schedule.

---

## 15. Client integration contract

- [ ] A canonical integration guide explains how each client obtains an IdP access token and calls NetHubKe.
- [ ] Clients send access tokens only to the intended API over TLS and never send ID tokens as API credentials.
- [ ] The BFF is responsible for its browser session and securely presenting the access token; it does not make authoritative authorization decisions.
- [ ] Browser clients do not receive confidential client secrets or NetHubKe database credentials.
- [ ] Client-side route guards are treated as UX only; server-side authorization remains authoritative.
- [ ] The API documents how clients select an organization context and how membership is checked.
- [ ] The API documents subscription and entitlement read contracts, freshness guarantees, and error semantics.
- [ ] Clients do not infer subscription state from UI state, payment redirects, or cached plan labels.
- [ ] Client behavior for 401, 403, 404, 409, and 429 is documented.
- [ ] Integration examples use placeholders and do not disclose real client IDs, user emails, tokens, or production endpoints.
- [ ] A compatibility test or staging smoke test validates the same shared integration flow for the website, Tawala, and NetPay.

---

## 16. Staging acceptance and production go/no-go

### End-to-end staging evidence

- [ ] A real access token from the configured IdP is accepted only for the correct issuer and NetHubKe audience.
- [ ] A token for a different API/client is rejected.
- [ ] A revoked client and disabled user are denied within the documented propagation bound.
- [ ] A user can access only their own profile and explicitly authorized organization resources.
- [ ] Two organizations with different memberships prove cross-tenant isolation.
- [ ] A service principal can access only the resources/capabilities explicitly granted to it.
- [ ] An organization can hold subscriptions for multiple products without cross-product privilege leakage.
- [ ] A verified payment activates the intended subscription exactly once.
- [ ] Duplicate and out-of-order payment webhooks do not corrupt subscription state.
- [ ] Expiry, grace period, cancellation, suspension, renewal, and reactivation produce the expected entitlement results.
- [ ] An entitlement change reaches product consumers within the documented propagation bound.
- [ ] A product request denied by entitlement is denied server-side even if the client bypasses its UI.
- [ ] Database and external dependency failures do not cause protected requests to fail open.
- [ ] Logs and audit records allow an operator to trace a sensitive operation without exposing secrets.
- [ ] Backup restore and rollback/recovery evidence is recorded.

### Production go/no-go

- [ ] All critical G0–G6 controls are verified or have an explicitly approved, time-bound exception that does not weaken tenant isolation or token validation.
- [ ] No unresolved critical/high security finding remains without formal risk acceptance.
- [ ] Required CI checks are green on the release candidate.
- [ ] Migration and rollback plans have been reviewed.
- [ ] Monitoring, alerts, on-call ownership, and incident escalation are active.
- [ ] Security, payment, subscription, and data-recovery runbooks are accessible to operators.
- [ ] Product owners have accepted the integration and entitlement contracts.
- [ ] Staging evidence and release commit are linked from the release/PR.
- [ ] A named owner has recorded the go/no-go decision.

---

## 17. Standards and reference baseline

Use the current versions and profiles applicable to the implementation; standards inform the controls but do not replace a documented platform threat model.

- [OAuth 2.0 Bearer Token Usage — RFC 6750](https://www.rfc-editor.org/rfc/rfc6750)
- [JSON Web Token Best Current Practices — RFC 8725](https://www.rfc-editor.org/rfc/rfc8725)
- [JWT Profile for OAuth 2.0 Access Tokens — RFC 9068](https://www.rfc-editor.org/rfc/rfc9068)
- [OAuth 2.0 Security Best Current Practice — RFC 9700](https://www.rfc-editor.org/rfc/rfc9700)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [OWASP API Security Top 10](https://owasp.org/API-Security/)
- [OWASP Application Security Verification Standard (ASVS)](https://owasp.org/www-project-application-security-verification-standard/)
- [NIST SP 800-63B — Authentication and Authenticator Management](https://pages.nist.gov/800-63-4/sp800-63b.html)
- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

## 18. NetHubKe-specific implementation notes and known verification targets

These are inspection targets based on the current repository baseline, not conclusions that a defect exists. Verify each against code, configuration, tests, and staging before changing its state.

- [ ] **Audience validation:** confirm production token validation checks the NetHubKe API audience. A trusted client ID/authorized-party check is an additional control, not a replacement for resource audience validation.
- [ ] **Token profile:** confirm access-token versus ID-token distinction and the actual configured IdP claim contract.
- [ ] **Scope enforcement:** confirm parsed scopes are enforced per route/action and are not merely carried in the principal object.
- [ ] **JWKS failure semantics:** verify bounded refresh, key rotation, outage behavior, and no fail-open path.
- [ ] **Trusted-client semantics:** document exact `aud`/`azp`/`client_id` handling, revocation propagation, and client-to-resource mapping.
- [ ] **Authorization completeness:** inventory every route and classify it as public, authenticated, organization-scoped, service-scoped, or administrative.
- [ ] **Tenant model:** verify explicit organization membership and resource-level authorization; do not equate a nullable `tenant_id` profile field with a complete tenancy model.
- [ ] **Service principals:** verify machine identity and delegated-user context are represented distinctly.
- [ ] **Subscription domain:** design and implement organization/product subscriptions, plan versions, lifecycle, payment evidence, webhook idempotency, and audit history centrally.
- [ ] **Entitlements:** define capability catalogue, plan mapping, overrides, quotas, evaluation, and propagation independently of subscription status.
- [ ] **Cache consistency:** establish and test revocation and entitlement freshness limits; document behavior during Redis/database outages.
- [ ] **Payment integrity:** use provider-verified server-side events and reconciliation; never activate from a browser return URL alone.
- [ ] **Operational readiness:** review diagnostics exposure, readiness behavior, audit integrity, alerts, restore tests, and deployment runbooks.
- [ ] **Documentation alignment:** update API and integration contracts as the implementation evolves; remove any historical statement that treats subscriptions/entitlements as permanently out of scope.

## 19. Evidence register

Keep links to the following evidence with the release candidate or readiness issue.

| Evidence | Link / reference | Owner | Date |
|---|---|---|---|
| Architecture and threat model | TBD | TBD | TBD |
| Route-to-policy inventory | TBD | TBD | TBD |
| Token validation test report | TBD | TBD | TBD |
| Tenant isolation test report | TBD | TBD | TBD |
| Subscription lifecycle specification/tests | TBD | TBD | TBD |
| Payment/webhook/reconciliation test report | TBD | TBD | TBD |
| Entitlement contract and propagation tests | TBD | TBD | TBD |
| PostgreSQL migration and restore evidence | TBD | TBD | TBD |
| Security assessment and remediation | TBD | TBD | TBD |
| Staging acceptance report | TBD | TBD | TBD |
| Production go/no-go approval | TBD | TBD | TBD |
