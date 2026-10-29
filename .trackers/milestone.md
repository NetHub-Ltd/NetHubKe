# SSO Programme Milestone Tracker
**Umbrella:** #57
**Architecture contract:** `docs/SSO_ARCHITECTURE_CONTRACT.md`
**Last inspected:** 2026-10-29
**Rule:** issue closure is not acceptance evidence; record CI/staging evidence separately.

| Milestone | Issues | Current state | Acceptance / next action |
|---|---|---|---|
| N0 | #40, #41; reconciliation #142 / PR #143 | User reports PR #143 merged to dev | Approved Zitadel/NetHubKe token-issuer architecture and trackers are the baseline. |
| N1 | #42, #43; implementation #144 / PR #145 | User reports PR #145 merged to dev | PR body reports 152 tests passed, 75.22% coverage and readiness workflow passed. No live Zitadel staging verification claimed. |
| N2 | #44, #45; approved implementation #146 | In progress on `feat/n2-managed-signing-keys` | Verify tests-first bootstrap, encrypted private-key custody, JWKS filtering/cache and migration/rollout behavior in CI. |
| N3 | #46, #47 | Not started | Generic product exchange and claim profiles; only after N2 acceptance. |
| N4 | #48, #49 | Not started | Product/org links, generic memberships and explicit entitlement precedence. |
| N5 | #50 | Not started | Rotation and invalidation, including compromised-key response. N2 must not claim N5 acceptance. |
| N6 | #51, #52 | Not started | Service catalogue API/UI and connected/trial/not-connected status. |
| N7 | #53 | Not started | Feature-flagged launch hop and redirect/error/token-leakage controls. |
| N8 | #54 | Not started | Read-only billing UI/API; NetHub remains billing source of truth. |
| N9 | #55 | Open | Settings route/toggles/profile polish after prior milestones are evidenced. |
| N10 | #56 | Open | Flag matrix, staging soak and end-to-end success criteria. |

## N2 implementation record
- User approved issue #146 on 2026-10-29.
- Branch: `feat/n2-managed-signing-keys`; PR target `dev`.
- Tests-first regression suite added before implementation edits. CI results remain pending.
- Private-key custody decision: Fernet encryption using externally supplied `SIGNING_KEY_ENCRYPTION_KEY`; production refuses legacy plaintext rows and missing/invalid encryption config. Existing rows require the documented backup + encryption helper rollout.
- Exchange remains default-off. No deployment change or staging readiness claim.
- N2 acceptance is not complete until CI, migration checks, Postgres/Redis behavior and test evidence are reviewed.

## Remaining architectural gaps (not silently closed by N2)
- Canonical identity mapping uses `(issuer, immutable sub)`.
- Maximum stale-access/revocation window is five minutes end-to-end.
- Live Zitadel staging verification and N10 operational readiness.
