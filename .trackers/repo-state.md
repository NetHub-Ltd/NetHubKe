# Repository State

- Repository: `NetHub-Ltd/NetHubKe`
- Default branch: `master`
- Current `master` base for this work: `ee768708b65c114413fc1f65aed1c99048af8bc6`
- PR #216 (authenticated `/me` profile dashboard) was merged to `master`; merge commit: `ee768708b65c114413fc1f65aed1c99048af8bc6`.
- No open pull requests were present when this work started.
- Current topic branch: `feat/dashboard-shell-next16`, created from the merge commit above.
- Current task issue: #217 — dashboard shell and Next.js 16 upgrade.

## Application baseline

- Frontend: Next.js 15.5.28, React 19.3.1, TypeScript, Tailwind CSS 3.
- Next.js package scripts still use the deprecated `next lint` command.
- Frontend CI uses Node.js 22 and runs install, lint, TypeScript typecheck and production build.
- Auth.js generic OIDC, PKCE/state cookies, server-side token handling, BFF routes and NetHubKe integration are established contracts.
- Root `AGENTS.md` is not present on `master`; repository engineering guidance is in the tracked docs and trackers.

## Merged corporate-site work

- PR #206 — corporate website foundation.
- PR #209 — typography, surface and login polish.
- PR #213/#214 — homepage positioning, service discovery and conversion work merged to `master`.
- PR #215 — Vercel redeploy trigger.
- PR #216 — authenticated `/me` account profile, merged to `master`.

## Current task scope — issue #217

- Move the profile route to `/dashboard/me`.
- Add an authenticated dashboard layout with a responsive light sidebar/header/content shell.
- Keep navigation lean: only the implemented **My profile** destination.
- Redirect `/dashboard` to `/dashboard/me` and retain `/me` as a compatibility redirect.
- Upgrade Next.js and its matching ESLint config to the current stable 16.x release; migrate linting to ESLint CLI and regenerate the npm lockfile.
- Add `src/proxy.ts` for a lightweight optimistic dashboard cookie-presence redirect. The dashboard layout remains the authoritative Auth.js session boundary.
- Update marketing chrome exclusions, crawler directives, docs and trackers.

## Security and architecture boundaries

- Do not create a second IdP or add a new authentication mechanism.
- Do not move token handling into the browser or expose tokens, cookies, claims or backend diagnostics.
- Preserve the existing Auth.js OIDC/PKCE/state configuration, server-side token forwarding, `getMe` first-login sync and server-side sign-out.
- Proxy checks are an optimization only; protected server rendering must still verify the Auth.js session.
- No backend, database, API contract or infrastructure changes.

## Verification expectations

- Node.js 22; `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.
- Confirm redirect behavior, protected layout, public chrome separation, noindex/robots behavior and responsive navigation.
- Do not claim a live production deployment or browser visual audit unless actually verified.
