# Browser → Next BFF → FastAPI

- Client components must call **same-origin** `/api/nethub/*` only.
- Do **not** set `NEXT_PUBLIC_*` to the resource-server URL for data fetches.
- Server: `BACKEND_URL` + `lib/server/backend.ts` (`backendFetch`).
- Auth session sync uses `backendFetch` inside the NextAuth JWT callback (server).
