# NetHubKe threat model (Resource Server + subscription authority)

**Status:** Living document. Update when architecture, IdP contract, or attack surface changes.  
**Related:** [RESOURCE_SERVER_READINESS.md](./RESOURCE_SERVER_READINESS.md), [IDP_TOKEN_PROFILE.md](./IDP_TOKEN_PROFILE.md), [AUTHZ_MATRIX.md](./AUTHZ_MATRIX.md).

---

## Scope and assets

| Asset | Sensitivity |
|-------|-------------|
| Access to NetHubKe APIs as a principal | High |
| Local user identity map `(issuer, subject) → user` | High |
| Organization membership and roles | High |
| Platform admin capability | Critical |
| Trusted client registry | Critical |
| Subscription / entitlement state (planned) | Critical |
| Audit trail integrity | High |
| Payment webhook authenticity (planned) | Critical |

**Out of scope for this RS:** IdP login UI, password storage, MFA enrollment (IdP owns these).

---

## Trust boundaries

```text
[ Browser / product app ]
        |  TLS + OIDC
        v
[ IdP (Zitadel / configured issuer) ]  -- issues access tokens
        |
        |  Bearer access token
        v
[ NetHubKe Resource Server ]  -- validates token, authorizes, stores domain data
        |
        +-- PostgreSQL (identity, orgs, apps, audit, future subscriptions)
        +-- Redis (optional trusted-client cache)
```

Assumptions:

- TLS terminates at the platform edge for all deployed environments.
- IdP JWKS is authentic for the configured issuer.
- Product backends and the website BFF do not mint NetHubKe product JWTs.

---

## Threats and mitigations

| ID | Threat | Impact | Mitigations (current / planned) | Residual risk |
|----|--------|--------|----------------------------------|---------------|
| T1 | **Stolen / replayed access token** | Attacker acts as user until expiry | Short-lived tokens (IdP); TLS; no token logging; rate limits | Until expiry; no server-side session kill yet |
| T2 | **Token intended for another API (confused deputy)** | Call NetHubKe with foreign audience | **Resource audience** (`RESOURCE_AUDIENCE`) enforced in staging/prod | Misconfigured empty audience fails closed in prod |
| T3 | **Unregistered or revoked client** | Rogue SPA/backend calls API | Trusted-client registry + revocation; cache TTL bound | Propagation delay ≤ cache TTL |
| T4 | **Privilege escalation via profile fields** | User sets `is_admin` | `UserUpdate` excludes admin; admin via bootstrap once or explicit admin API + audit | Bootstrap email list is sensitive config |
| T5 | **Continuous bootstrap re-elevation** | Demoted admin auto-restored | One-shot bootstrap on first provision only | Ops must use explicit grant after bootstrap |
| T6 | **Cross-tenant / cross-org access** | Read another org’s data | Organization membership model; membership-gated routes return 404 | Applications still user-scoped (not org-scoped yet) |
| T7 | **IDOR on user-owned applications** | Guess UUID → access | Owner check → 404 | Same pattern required for future org resources |
| T8 | **Admin action without attribution** | Unaccountable changes | Audit events for client create/revoke, status change, admin grant, org membership | No UI for audit search yet |
| T9 | **Webhook forgery / billing abuse** (planned) | Fake activation | Planned: signature verify, idempotency keys, never trust browser return URL | Not implemented until P2 |
| T10 | **DoS on auth / sync endpoints** | Availability loss | Rate limiting (slowapi); fail closed on JWKS errors | No global edge WAF documented here |
| T11 | **JWKS outage / key rotation failure** | Auth unavailable or fail-open | Fail closed; bounded JWKS timeout/cache | Availability impact during IdP outage |
| T12 | **Audit log injection / secret leakage** | Credentials in logs | Redaction of bearer/password/token patterns in audit detail | Defense in depth; keep logs off public sinks |
| T13 | **Client compromise** | Valid tokens from stolen client | Revoke trusted client; rotate IdP client secret at IdP | Product-side secret handling is product-owned |

---

## Mapping to readiness controls

| Readiness area | Threat IDs primarily addressed |
|----------------|--------------------------------|
| Token validation / audience (§3) | T1, T2, T3, T11 |
| Authorization / tenancy (§4) | T4, T5, T6, T7 |
| Subscription / payment (§6) | T9 (planned) |
| Audit / monitoring (§11) | T8, T12 |
| API abuse controls (§9) | T10 |

---

## Explicit non-goals (do not “mitigate” by expanding scope)

- NetHubKe will not become an Authorization Server or mint product access tokens.
- NetHubKe will not store user passwords or MFA secrets.
- Browser claims of payment success are never authoritative.

---

## Review cadence

Revisit this model when adding subscriptions/entitlements, service principals, or new admin surfaces. Link residual risks into release go/no-go notes.
