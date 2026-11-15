# Task — Resource Server Readiness Audit & Gap Closure

## Status

- Workstream: Audit NetHubKe against `docs/RESOURCE_SERVER_READINESS.md` (PR #226, merged) and open implementation issues.
- Status: **Audit complete on topic branch**; implementation issues opened; code fixes not started.
- Topic branch: `docs/rs-readiness-audit-2026-11`
- Base branch: `dev` (includes merge of PR #226 at `f0f6011`)
- Pull-request target: `dev`
- Audit report: `docs/RS_READINESS_AUDIT_REPORT.md`

## Completed this session

- [x] Merged PR #226 (Resource Server readiness checklist) into `dev`.
- [x] Full codebase inspection against checklist gates G0–G6.
- [x] Evidence-backed audit report with file/symbol anchors.
- [x] Prioritized P0–P3 remediation roadmap.
- [x] GitHub issues opened for critical and high-priority gaps.
- [x] Trackers updated.

## Gate verdict (summary)

| Gate | Verdict |
|------|---------|
| G0 Architecture | Partial |
| G1 Token security | Partial — **critical** (no resource `aud` validation) |
| G2 Authorization & tenancy | Weak |
| G3 Subscription & entitlements | Absent |
| G4 Data & API security | Partial |
| G5 Operations | Partial |
| G6 Production acceptance | Not met |

## Priority order for implementation (do not skip P0)

1. **P0-1** Enforce resource audience validation (`verify_aud`)
2. **P0-2** IdP access-token profile documentation + tests
3. **P0-3** Route authorization inventory
4. **P1-*** Organization membership, scoped admin, audit events, threat model
5. **P2-*** Subscription domain + entitlements
6. **P3-*** Hardening polish + staging evidence

## Explicit non-goals this branch

- No application code changes beyond documentation and trackers.
- No subscription implementation in this PR.
- No claim that production is ready.

## Related documents

- `docs/RESOURCE_SERVER_READINESS.md` — standard
- `docs/RS_READINESS_AUDIT_REPORT.md` — this audit
- `docs/INTEGRATIONS.md` — client contract
- `.trackers/milestone.md` — historical A0–A6 (superseded for billing scope)
