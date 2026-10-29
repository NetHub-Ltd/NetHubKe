# Task: Consolidated N3–N5 implementation (generic exchange, entitlements, key operations)
- Implementation issue: #148 — contract created 2026-10-29; maps to existing milestone issues #46–#50 without replacing their history.
- Programme umbrella: #57; approved architecture contract: `docs/SSO_ARCHITECTURE_CONTRACT.md`.
- Delivery plan: three PRs total — PR 1 N3–N5 (#148), PR 2 N6–N7 (#149), PR 3 N8–N10 (#150).
- Branch: `feat/n3-n5-token-policy-rotation` → PR target `dev`.
- N2 predecessor: issue #146 / PR #147 merged to `dev` at merge commit `31f61ded9a124009db8bdecf2c251d2628ade756` (2026-10-29). Exchange remains default-off; no live staging readiness is implied.
- Scope: audit and harden generic product exchange/claim profiles, product/org links and explicit entitlement precedence, signing-key rotation and emergency response. PostgreSQL is durable source of truth; Redis is disposable cache.
- Contract boundaries: no N6/N7 catalogue/launch work and no N8–N10 billing/settings work in this PR. Do not enable flags or change deployment.
- Tests-first; inspect current implementation and tests before edits. Do not infer acceptance from closed legacy issues.
- Workflow: topic branch; PR targets `dev`; update all four trackers at meaningful transitions; no merge without explicit user approval. Do not rebase, squash, reset, force-push, or rewrite history.
