# Task: Fix Frontend CI install (npm ci → npm install)

## Problem
- `.github/workflows/frontend-ci.yml` used `npm ci` when lockfile present
- Install step fails with `npm error code EUSAGE` on every recent run
- Root `package.json` declares workspaces but there is no root lockfile; running `npm ci` inside `apps/frontend` under Node 24 / npm 11 fails even though `package-lock.json` exists

## Change
- Replace conditional `npm ci` / `npm install` with plain `npm install`
- Keep cache + working-directory unchanged

## Verified
- Workflow YAML updated; will be validated by CI on PR
