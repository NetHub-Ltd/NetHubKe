# Task — RS readiness P1 implementation

## Status

- Workstream: Organization membership, platform-admin provisioning, audit events, threat model.
- Topic branch: `feat/rs-p1-orgs-roles-audit`
- Base branch: `dev` (includes P0 merge #239)
- Issues: #230 #231 #232 #233

## Delivered in this branch

- Organizations + memberships (multi-org, role owner/admin/member, 404 across orgs)
- One-shot `BOOTSTRAP_ADMIN_EMAILS` + explicit `POST /admin/users/{id}/platform-admin`
- Audit events for privileged actions with redaction helper
- `docs/THREAT_MODEL.md` linked from readiness checklist

## Non-goals

- Subscriptions / entitlements (P2)
- Moving service applications onto org ownership (still user-scoped)
- Full RBAC permission matrix beyond org roles + platform admin
