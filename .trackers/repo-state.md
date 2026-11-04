# Repository State

- Repository: `NetHub-Ltd/NetHubKe`
- Default branch: `master` (verified from GitHub repository metadata)
- Integration branch: `dev` (created from `master` for this work because it was absent)
- Previous topic branch: `feat/corporate-website-growth-partner` (PR #206 merged)
- Integration branch: `dev` (restored from current `master` after it was absent)
- Current topic branch: `polish/corporate-typography-login`
- Topic branch base: `dev`
- Delivery: one PR targeting `dev`; do not merge without user approval.
- Current task: corporate typography, subtle elevation and standalone login polish (issue #208).

## Relevant issues

- #201 — corporate visual system and shared shell
- #202 — homepage, services and about
- #203 — upcoming Tawala and NetPay showcases
- #204 — business enquiry journey
- #205 — technical SEO and public-site quality

## Observed baseline

The frontend is Next.js 15 / React 19 / TypeScript / Tailwind CSS 3. Existing Auth.js generic OIDC, PKCE/state cookies, BFF token forwarding and NetHubKe integration are preserved.

The repository currently contained only `.trackers/milestone.md` in the tracker directory. This file concerns backend Architecture A and is left unchanged.
