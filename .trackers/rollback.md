# Rollback — NetHub Corporate Website

## Change boundary

This work changes the public frontend presentation, marketing routes, SEO metadata/routes, frontend documentation and tracker files.

No database schema, backend API, Auth.js callback, OIDC token flow, BFF contract or deployment infrastructure change is intended.

## Rollback procedure

- Before merge: close/revert the topic PR; no production rollback is needed.
- After merge: revert the corporate website PR commit(s) through a new reviewed PR to `dev`.
- Remove `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_CONTACT_EMAIL` only if no longer used after rollback.
- Restore the previous frontend pages/components/tokens from the revert; do not manually reconstruct auth files.

## Data and external effects

- No database writes or migrations are introduced.
- The contact form does not transmit or persist enquiry data. It only opens a visitor-controlled email draft when configured.
- No secrets are added to the repository.

## Follow-up polish rollback

The typography, surface elevation and login presentation are frontend-only. Revert the follow-up PR through a reviewed PR to `dev`. Do not alter `src/auth.ts`, `/api/auth/*`, token helpers or BFF routes during rollback.

## Risks

- A wrong `NEXT_PUBLIC_SITE_URL` would generate incorrect canonical and sitemap URLs; set it to the confirmed production origin.
- Without `NEXT_PUBLIC_CONTACT_EMAIL`, the enquiry form reports that email contact is not configured and does not claim success.
- Visual regressions in the existing authenticated `/login` and `/me` surfaces must be checked because they share the root layout and global tokens.
