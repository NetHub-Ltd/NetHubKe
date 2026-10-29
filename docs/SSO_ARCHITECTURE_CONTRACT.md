# NetHubKe Ecosystem Identity & Access Contract
**Decision status:** Approved architecture baseline, 2026-10-29  
**Planning issue:** #142  
**Programme umbrella:** #57  
**Related conflict:** #135  
**Implementation status:** This document does not authorize implementation; implementation requires separate issue/acceptance approval.

## 1. Responsibility boundaries

- **Zitadel:** OIDC identity provider, authentication, MFA, IdP session and upstream identity proof.
- **NetHubKe:** IdP integration/validation, canonical ecosystem identity mapping, service registry, global access policy, user and organization entitlement/grant evaluation, centralized administration/audit, and product-facing token issuance.
- **Product APIs (including Tawala and NetPay):** validate NetHubKe-issued tokens locally via JWKS and enforce their own domain/business permissions. They should not need to decode Zitadel tokens, store/hash passwords, or call NetHubKe on every API request.
- **PostgreSQL:** durable source of truth. **Redis:** cache/coordination only, never the only copy of grants, key state, or audit records.

## 2. Identity mapping and lifecycle

- Canonical identity maps an upstream identity by the pair (issuer, immutable subject); email is an attribute, not a primary identity key.
- Account linking must be explicit and controlled. A matching email alone must not silently merge accounts or reactivate a disabled identity.
- Disabled/blocked canonical identities are denied even if an upstream token is otherwise valid.
- NetHubKe owns ecosystem identity and access policy; each product owns its own user/staff records and business authorization.

## 3. Service policy and access decisions

Service registry must represent stable service slug/audience and lifecycle state; public availability independently from whether login is required; support for individual users and/or organizations; subscription/entitlement requirements and individual grants; and a narrowly defined centrally authorized administrative grant path with durable audit.

Decision evaluation is explicit, not a single ambiguous entitled boolean:
1. Validate identity and token provenance.
2. Deny if identity is disabled/blocked.
3. Deny if service is globally disabled or unavailable under policy.
4. Enforce the service authentication requirement.
5. Evaluate organization/tenant entitlement when required.
6. Evaluate individual grant when required by service policy.
7. Apply only explicitly authorized administrative grants, audit the change, and never allow them to bypass global disable or disabled identity.
8. Return a policy decision and mint a product token only when all required conditions pass.

Exact precedence when organization and individual grants disagree must be specified per policy mode and tested before implementation. No implicit owner-means-allow-all rule.

## 4. Product JWT contract

- NetHubKe issues short-lived, audience-specific JWTs only after server-side policy evaluation.
- Product APIs verify JWT signatures locally against NetHubKe JWKS and validate exact issuer, intended audience, expiry/not-before, allowed algorithm, token type and required claims.
- Required claims: iss, stable canonical sub, aud, iat, exp, jti; JOSE header contains kid. Organization/user context and grants are server-derived, not caller-selected.
- A token for one product is not valid for another product. Reject wrong audience, issuer, algorithm, token type, missing required claims, expired token and disabled/retired signing key as appropriate.
- No private signing keys in product services or frontend bundles. Managed key rotation publishes active and retiring public keys via JWKS with bounded cache staleness.
- Human tokens and machine tokens are distinct principal types and audiences. Machine identities have an owner, explicit scopes/audience, rotation, and revocation; they do not inherit human/admin authority by default.

## 5. Revocation and freshness bound

The maximum stale-access window is **five minutes end-to-end** after an access grant is removed, identity is disabled, organization entitlement is revoked, or service access is disabled. This is a bound across the entire system, not five minutes per layer.

The implementation design must account for token lifetime, refresh/renewal, entitlement and policy caches, JWKS caches, clock skew, retries and propagation. Do not add individual TTLs together and claim compliance. Normal policy changes must be reflected within the bound. Compromised signing keys and emergency global disable require a documented, tested accelerated response and cache invalidation path.

## 6. Central administration and audit

- NetHubKe is the central control plane for service registration, lifecycle, global access policy, user/org grants, and machine identity administration.
- Administrative routes require centrally defined authorization and least privilege; UI visibility is not authorization.
- Durable audit records capture actor, action, target, before/after or decision details, timestamp and outcome for sensitive changes. Structured logs complement but do not replace durable audit.
- Products remain responsible for their own domain roles, resource permissions and data-level access checks.

## 7. Path A issue #135 reconciliation

Retain reusable parts of #135: authorization-only data in NetHubKe; no operational cashier/staff tables; generic membership rather than per-product membership tables; external_user_id links to product-owned domain primary key; generic product slugs and product-specific organization links where required.

The original Path A mechanism—product forwards an upstream Zitadel bearer once and NetHubKe does not mint a product token—is **not the default ecosystem architecture** because it contradicts the approved NetHubKe-issued JWT trust model. Preserve #135 and its history; revise/split it only through explicit planning. Any temporary direct-IdP-token compatibility path must have a named consumer, threat boundary, feature flag, expiry/removal date and separate acceptance criteria. Product APIs must not adopt that exception as a general pattern.

## 8. Programme order and acceptance evidence

The programme remains N0 → N10; do not jump ahead based only on issue closure:
- N0: governance, architecture and tracker baseline.
- N1: exchange path and CI regression coverage (#42, #43).
- N2: managed signing keys and JWKS cache/rotation foundation (#44, #45).
- N3: generic product exchange and claim profiles (#46, #47).
- N4: product/org links and entitlement evaluation (#48, #49).
- N5: rotation and invalidation (#50).
- N6: service catalogue UI/API (#51, #52).
- N7: launch hop (#53).
- N8: read-only billing view (#54).
- N9: settings (#55).
- N10: operational runbook, staging soak and end-to-end success criteria (#56).

Issues #42–#54 are marked closed but retain unchecked acceptance boxes. They are **closed in GitHub, acceptance evidence unverified** until code, CI and staging evidence is recorded. #55 and #56 are open. The earliest not-demonstrably-accepted milestone is N1, pending verification. The #42/#43 milestone assignment was corrected from 11 to 2 based on the observed N0=1, N2=3, …, N10=11 sequence; #55/#56 align with that mapping. The project board remains the programme status source.

## 9. Non-goals and rollout constraints

- No second password store or independent login system.
- No universal business-permissions engine replacing product-owned authorization.
- No per-request introspection calls from product APIs on hot paths.
- No unrestricted self-registration of services or caller-controlled roles, organization IDs, entitlements or principals.
- No implementation, schema migration, runtime configuration, feature-flag change or deployment change as part of planning issue #142.
- New runtime paths remain behind default-off flags until their milestone acceptance is met on staging.
