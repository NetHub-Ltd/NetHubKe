# Rollback — NetHub Corporate Site Discovery & Conversion

## Change boundary

This branch changes public frontend page content, service landing routes, service content data, page metadata, sitemap entries, contact handoff copy, corporate website documentation and tracker files.

The typography, surface tokens and login presentation were merged into `dev` through PR #209 and are not introduced by this branch.

No database schema, backend API, Auth.js/OIDC callback, token flow, BFF contract, or deployment infrastructure change is intended.

## Rollback procedure

- Before merge: close PR #213; no production rollback is needed.
- After merge: revert PR #213 through a new reviewed PR targeting `dev`.
- Restore prior public page content and sitemap entries through the revert; do not manually reconstruct authentication or shared design-token files.

## Data and external effects

- No database writes or migrations are introduced.
- The contact form continues to open a visitor-controlled email draft. The website does not transmit or persist enquiry data.
- No secrets or new paid services are added.

## Risks

- Service landing page copy and metadata must stay aligned with services NetHub actually offers.
- Service enquiry query values must continue matching the contact form's available options.
- The direct-email fallback appears only when `NEXT_PUBLIC_CONTACT_EMAIL` is configured.
- Search results may continue to show stale or unrelated content until the production deployment and search index reflect the approved site.
- Visual review remains required on mobile and desktop; screenshot-based visual audit was not available during this chat.


## Follow-up — `/me` account dashboard

### Change boundary

- Replaces the old `/me` diagnostics UI with a responsive authenticated profile dashboard.
- Updates the `NetHubUser` frontend type to include optional profile timestamps.
- Gives `/me` its own focused header by excluding it from the public marketing header/footer.
- Preserves the existing session guard, profile API call, first-login sync and server-side sign-out.

### Rollback

Revert the account-dashboard PR through a reviewed PR targeting `master`. This restores the previous `/me` page and shared chrome behavior. No database or backend rollback is required.

### Risk

Profile display depends on the existing `NETHUB_API_URL` and IdP access-token forwarding. If profile retrieval fails, the page shows a generic retry state and does not expose diagnostic details or credentials.


## Follow-up — dashboard route migration and Next.js 16

### Change boundary

- Moves the existing profile UI from `/me` to `/dashboard/me` and retains `/me` as a redirect.
- Adds a shared responsive dashboard shell and dashboard route protection.
- Adds Next.js 16 `src/proxy.ts` with an optimistic session-cookie-presence check; the dashboard layout remains responsible for the real Auth.js session validation.
- Upgrades frontend framework and lint configuration, migrates the lint command and regenerates the npm lockfile.
- Updates marketing chrome exclusions, robots directives, documentation and trackers.
- Does not change OIDC provider configuration, PKCE/state handling, token storage/forwarding, NetHubKe API contracts, backend or database.

### Rollback

Revert the dashboard/Next.js upgrade PR through a new reviewed PR targeting `master`. This restores the prior `/me` route and frontend dependency versions. No backend, database or IdP rollback is required.

### Risks and safeguards

- A present session cookie is only an optimistic signal; it is not proof of a valid session. The dashboard layout must call Auth.js `auth()` and redirect invalid/expired sessions to `/login`.
- Both secure and non-secure Auth.js cookie names must be recognized by Proxy because the existing configuration chooses based on the public URL.
- Preserve the current server-only access-token retrieval and generic profile-unavailable state.
- Validate npm lockfile consistency with `npm ci` after the Next.js 16 dependency upgrade.
- Do not claim production deployment or visual browser verification without evidence.
