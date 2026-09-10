# Task: Frontend ESLint cleanup

## Goal
Resolve all 11 ESLint warnings from `npm run lint` so lint and build are clean.

## Changes
- Remove unused vars (dashboard `error`, not-found `ChevronLeft`, next-auth.d.ts imports)
- Replace `any` with proper types in auth.ts, useApi, api utils
- Convert `<img>` → `next/image` in Footer (local) and about (remote + remotePatterns)
- Suppress `@next/next/no-page-custom-font` for Material Symbols link (unsupported by next/font)
- Relax JWT augmentation fields to optional to match runtime / next-auth callback contract

## Verified
- `npm run lint` → 0 problems
- `npm run build` → success
