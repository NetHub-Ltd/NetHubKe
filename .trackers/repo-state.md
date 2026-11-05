# Repository State

- Repository: `NetHub-Ltd/NetHubKe`
- Default branch: `master`
- Current `master` base for this work: `ee768708b65c114413fc1f65aed1c99048af8bc6`
- PR #216 (authenticated `/me` profile dashboard) was merged to `master`; merge commit: `ee768708b65c114413fc1f65aed1c99048af8bc6`.
- No open pull requests were present when this work started.
- Current topic branch: `feat/dashboard-shell-next16`, created from the merge commit above.
- Current task issue: #217 — dashboard shell and Next.js 16 upgrade.

## Application baseline

- Frontend: Next.js 16.4.5, React 19.3.1, TypeScript, Tailwind CSS 3.
- Linting: ESLint 10.14.0 with `eslint-config-next` 16.4.5 native flat config; `npm run lint` executes `eslint .`.
- Minimum Node.js version is 20.19.0 (ESLint 10 requirement); frontend CI runs Node.js 22 with `npm ci`, lint, TypeScript typecheck and production build.
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
- Upgrade completed on PR #218: Next.js 16.4.5, `eslint-config-next` 16.4.5, ESLint 10.14.0, native flat config, ESLint CLI and regenerated lockfile.
- Added `src/proxy.ts` for a lightweight optimistic dashboard cookie-presence redirect. The dashboard layout remains the authoritative Auth.js session boundary.
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


## Current implementation — PR #218

- PR: https://github.com/NetHub-Ltd/NetHubKe/pull/218
- Issue: #217
- Topic branch: `feat/dashboard-shell-next16`
- Latest application commit verified by frontend CI: `d21a4b6d127587c2b5241e9b30ec36cc5708ed59`; current tracker-only commit before this update: `9e545ac4e7480e8809a4afe66eaf2b7788999e33`.
- Target: `master`; PR is not merged.

### Delivered

- Authenticated responsive light dashboard shell: desktop sidebar, mobile navigation, shared header, sign-out and main content.
- Profile moved to `/dashboard/me`; `/dashboard` redirects there and `/me` remains a compatibility redirect.
- Navigation exposes only the implemented **My profile** destination.
- Existing Auth.js OIDC, server-side token retrieval, NetHubKe profile fetch/first-login sync and sign-out are preserved.
- Next.js 16.4.5, `eslint-config-next` 16.4.5, ESLint 10.14.0, Node.js minimum 20.19.0, native flat ESLint config and lockfile migration.
- Next.js 16 `src/proxy.ts` checks presence of either Auth.js session-cookie name, including chunked variants; dashboard layout calls `auth()` as the real session check.
- Updated robots, metadata, public chrome route exclusions, docs, README and Next.js 16 TypeScript configuration.

### Verification

- Frontend CI run #228 on the latest application commit passed `npm ci`, `npm run lint`, `npx tsc --noEmit` and `npm run build`.
- Build output confirmed Next.js 16.4.5 (Turbopack), both dashboard routes and Proxy recognition.
- Next build no longer rewrites `tsconfig.json`; the Next.js 16 `react-jsx` and `.next/dev/types` settings are committed.
- CodeQL run #99 completed successfully for both Python and JavaScript/TypeScript on the tracker head before this update.
- No browser visual audit or production deployment has been verified. Do not describe the dashboard as visually reviewed or deployed.
