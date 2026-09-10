# Task: Frontend CI lint + build workflow

## Goal
CI: lint then build for apps/frontend.

## Completed
- frontend-ci.yml: Node 24, no npm cache without lockfile (fixes setup-node path error)
- lint → build with placeholder auth env

## Follow-up
- Commit package-lock.json and re-enable setup-node cache
