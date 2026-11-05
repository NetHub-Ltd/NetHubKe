# Repository State

- Repository: `NetHub-Ltd/NetHubKe`
- Default branch: `master`
- Historical integration branch: `dev` (deleted after the integration into `master`)
- Current `master` base for this follow-up: `9d061024f7a2809934c9619301c81afad45c4608`
- Current topic branch: `feat/me-account-dashboard`
- Merged PRs: #213 (site discovery), #214 (`dev` → `master`), #215 (Vercel redeploy trigger).\n- Current PR: #216 targeting `master`; do not merge without user approval.
- Previous issue #212 — corporate site positioning, service discovery, conversion and SEO (completed).

## Merged corporate-site work

- PR #206 — corporate website foundation and approved Growth Partner positioning.
- PR #209 — Poppins/DM Sans typography, selected surface elevation and standalone NetHub login.
- PR #209 is part of the latest `dev` base and must not be overwritten by this topic branch.

## Current topic branch scope

- Homepage business positioning and conversion hierarchy.
- Shared service content catalogue and four focused service landing pages.
- Service index discovery and relevant enquiry paths.
- Page metadata, canonical URLs and sitemap entries.
- Contact email handoff clarity and direct email fallback.
- Trackers and corporate website documentation.

## Application baseline and boundaries

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 3.
- Auth.js/OIDC, PKCE/state cookies, BFF token forwarding and NetHubKe integration must remain unchanged.
- No backend API, database, authentication, token handling, BFF or infrastructure changes are in scope.
- Keep Tawala and NetPay marked Coming soon.


## Current account dashboard follow-up

- `/me` is protected by the existing Auth.js session and uses the existing NetHubKe `getMe` server-side call.
- Dashboard presents profile/account information only; it must never display raw access tokens, ID tokens, cookie names, decoded claims or backend diagnostics.
- Existing OIDC sign-in, PKCE/state, BFF and backend contracts remain unchanged.
