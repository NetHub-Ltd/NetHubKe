# Repository State

- Repository: `NetHub-Ltd/NetHubKe`
- Default branch: `master` (verified from GitHub repository metadata)
- Integration branch: `dev`
- Current topic branch: `feat/site-visual-login-polish`
- Topic branch base: latest `dev` at task start
- Delivery: one PR targeting `dev`; do not merge without user approval.
- Current task: typography, global gradient canvas, subtle content elevation and login-page polish.
- Tracking issue: #210.

## Relevant previous delivery

- PR #206 — corporate website experience; merged to `dev`.

## Current scope

- Poppins headings and DM Sans body/interface typography.
- Existing blue/cyan gradient as the global canvas.
- Deep navy/warm ink instead of pure black.
- Restrained shadow/elevation for selected light content cards.
- Centered NetHub login experience with site chrome hidden on `/login`.
- Preserve Auth.js OIDC, PKCE/state, token and BFF behavior.

## Observed frontend baseline

Next.js 15 / React 19 / TypeScript / Tailwind CSS 3. The existing generic OIDC login server action invokes `signIn("oidc", { redirectTo: "/me" })`.

## Authentication boundary

No intended changes to `apps/frontend/src/auth.ts`, Auth.js provider configuration, PKCE/state cookies, token handling, BFF routes or backend identity/authorization contracts.
