# Rollback — NetHub Website Visual and Login Polish

## Change boundary

This follow-up changes frontend typography, global canvas styling, light content surface elevation, root site chrome rendering and the presentation of `/login`.

It does not change database schema, backend APIs, Auth.js provider configuration, OIDC callbacks, PKCE/state cookie handling, token flow, BFF contracts or identity-provider behavior.

## Rollback procedure

- Before merge: close/revert the topic PR; no production rollback is needed.
- After merge: revert the website polish PR through a new reviewed PR to `dev`.
- Reverting the PR restores the previous font imports, global theme tokens, root layout composition and login presentation.
- Do not manually reconstruct or alter authentication configuration during rollback.

## Data and external effects

- No database writes or migrations are introduced.
- No new secrets or deployment variables are required.
- No external service behavior is changed.

## Risks and verification

- Confirm the new Next.js font imports resolve in CI and the production build.
- Review the gradient and elevated surfaces across public pages at mobile/tablet/desktop sizes.
- Confirm `/login` still initiates the existing OIDC sign-in and returns to `/me`.
- Confirm authenticated `/me` and other routes still render the normal site chrome.
- No merge until CI and visual/authentication regression checks are reviewed.
