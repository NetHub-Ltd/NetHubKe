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
