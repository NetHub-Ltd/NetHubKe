# SSO Programme Milestone Tracker
**Umbrella:** #57  
**Planning reconciliation:** #142  
**Architecture contract:** docs/SSO_ARCHITECTURE_CONTRACT.md  
**Last inspected:** 2026-10-29  
**Status convention:** GitHub issue closure is not acceptance evidence when its checklist is unchecked.

| Milestone | Issues | GitHub state observed | Acceptance / next action |
|---|---|---|---|
| N0 | #40, #41; follow-up #142 | #40/#41 closed; #142 open | Governance artifacts exist. Reconcile approved Zitadel/token-issuer architecture and trackers. |
| N1 | #42, #43 | Closed; acceptance boxes unchecked | Earliest not-demonstrably-accepted milestone. Verify exchange flag-off behavior, CI coverage, AUTH_MATRIX and staging evidence before advancing. |
| N2 | #44, #45 | Closed; acceptance boxes unchecked | Verify PostgreSQL signing-key lifecycle, JWKS active+retiring keys, Redis invalidation, private-key custody and outage behavior. |
| N3 | #46, #47 | Closed; acceptance boxes unchecked | Verify generic exchange, product registry/audience enforcement, claims contract and compatibility alias. |
| N4 | #48, #49 | Closed; acceptance boxes unchecked | Verify organization links, generic membership, explicit user/org grant precedence and fail-closed entitlement cache behavior. |
| N5 | #50 | Closed; acceptance boxes unchecked | Verify key rotation, dual JWKS publication, retirement and cache purge, including compromised-key response. |
| N6 | #51, #52 | Closed; acceptance boxes unchecked | Verify service listing and connected/trial/not-connected status against backend data. |
| N7 | #53 | Closed; acceptance boxes unchecked | Verify feature-flagged launch exchange, redirect, error handling and token leakage controls. |
| N8 | #54 | Closed; acceptance boxes unchecked | Verify read-only billing UI/API and that NetHub remains billing source of truth. |
| N9 | #55 | Open | Settings route/toggles/profile polish; do not treat as current until N1–N8 acceptance is evidenced. |
| N10 | #56 | Open | Flag matrix, staging soak, end-to-end success criteria and close umbrella only when evidenced. |

## Data-quality findings
- #42/#43 body says N1 but their GitHub milestone assignment is 11; do not guess the intended milestone ID.
- #55 body says N9 and is assigned milestone 10; #56 body says N10 and is assigned milestone 11. These may be correct or incorrect; verify actual GitHub milestone names/IDs before changing.
- .trackers/repo-state.md previously pointed at feat/n8-billing-read while task tracker pointed at feat/idp-agnostic-oidc; both were stale relative to inspected dev baseline.
- Issue #135's Path A direct-IdP-token mechanism conflicts with the approved token issuer model. Preserve generic membership/external-user-link concepts and issue history; explicitly revise/split before implementing the endpoint as an ecosystem contract.

## Session gate
Work must proceed N0 → N10. First verify N1 evidence (#42/#43) and then move forward in order. Planning-only issue #142 does not authorize application implementation. Separate user approval is required for the implementation issue/acceptance plan.
