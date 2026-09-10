# Task: Frontend ESLint + CI green

## Root cause
- `eslint-config-next` was wrongly pinned to `^0.2.4` (missing next/core-web-vitals)
- ESLint 10 + FlatCompat circular config crash
- react-hooks/set-state-in-effect errors in Navbar + cookieBanner

## Completed
- eslint-config-next@16.2.3, eslint@9, native flat config
- Fixed Navbar/cookieBanner lint errors
- package-lock.json committed; CI Node 24 + npm ci + cache
- Verified: npm run lint (exit 0), npm run build (exit 0)
