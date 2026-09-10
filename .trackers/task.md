# Task: Dashboard shell + Profile as default

## Goal
Replace the sparse `/dashboard` page with a real authenticated app shell:
- Public Navbar/Footer hidden on private routes
- Collapsible sidebar + dashboard top navbar
- Default route = Profile, displaying (and allowing limited edit of) real backend user data

## Approved scope (user: approved 2026-09-11)
- Tier 2
- Expand `UserRead` additively: `username`, `phone_number`, tenant summary (`name`, `tier`), `created_at`
- `/dashboard` redirects to `/dashboard/profile`
- Edit surface: `full_name` only (existing `UserUpdate`)
- Sidebar: Profile (active) + placeholders for Settings / Billing
- Frontend: private layout, sidebar, top nav, profile page
- Backend: additive schema + response enrichment; `/me` uses keycloak sub lookup + tenant load
- Verify: `npm run lint`, `npm run build`
- PR target: `dev`

## Status
**COMPLETE** — merged to `dev` as PR #35 (`7d50c35`).

## Completed
- [x] Expanded `UserRead` (backend schema + frontend Zod/types)
- [x] `/users/me` + sync + PATCH return enriched payload; lookup by `keycloak_id` / tenant load
- [x] `AppChrome` hides public Navbar/Footer on `/dashboard*`
- [x] Dashboard shell: collapsible Sidebar, TopNav, DashboardShell
- [x] `/dashboard` → redirect `/dashboard/profile`
- [x] Profile page: display enriched fields, edit full_name via PATCH
- [x] `npm run lint` → 0 errors
- [x] `npm run build` → success
- [x] PR #35 merged into `dev`

## Remaining
- (none for this task)

## Active follow-ups
- Settings / Billing pages (sidebar placeholders)
- Edit phone_number (requires UserUpdate expansion)
- Full OpenAPI regenerate when backend is running in CI
- Optional: richer tenant / subscription cards on Profile

## Decisions
- Data richness: A (expand UserRead)
- Default: redirect to profile
- Editable: full_name only
- Sidebar: Profile + placeholders

## Risks
- Layout isolation must not break public pages — AppChrome pathname gate
- Additive schema only
- Rollback: revert PR #35 if needed
