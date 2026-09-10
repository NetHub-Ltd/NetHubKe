# Task: Frontend CI lint + build workflow

## Goal
Add GitHub Actions workflow that runs `npm run lint` then `npm run build` for `apps/frontend`.

## Approved scope
- `.github/workflows/frontend-ci.yml` on push/PR to dev/master (frontend paths)
- Placeholder env for NextAuth/Keycloak at build time only

## Completed
- Workflow: lint → build in `apps/frontend`

## Out of scope
- Backend CI
- Changing lint rules
