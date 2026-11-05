# Repository State

- Repository: `NetHub-Ltd/NetHubKe`
- Default branch: `master`
- Integration branch: `dev`
- Latest `dev` base synchronized into current topic branch: `f52896f655c1d1ce0e2994d7c30dd426e117c2bd`
- Current topic branch: `feat/site-discovery-conversion-review`
- Current PR: #213 targeting `dev`; do not merge without user approval.
- Current issue: #212 — corporate site positioning, service discovery, conversion and SEO.

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
