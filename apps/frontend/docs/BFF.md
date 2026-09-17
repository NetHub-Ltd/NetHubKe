# Browser → Next BFF → FastAPI

- Client components must call **same-origin** `/api/nethub/*` only.
- Do **not** set `NEXT_PUBLIC_*` to the NetHub resource-server URL for data fetches.
- Server: `BACKEND_URL` (server-only) + `lib/server/backend.ts` (`backendFetch`).
- Auth session sync uses `backendFetch` inside the NextAuth JWT callback (server).

## Routes

| Browser | Upstream |
|---------|----------|
| `GET/PATCH /api/nethub/users/me` | `/api/v1/users/me` |
| `GET /api/nethub/services/my-status` | `/api/v1/services/my-status` |
| `POST /api/nethub/auth/exchange` | `/api/v1/auth/exchange` |

Product launch URLs (e.g. `NEXT_PUBLIC_TAWALA_LAUNCH_URL`) are **product** origins, not the NetHub API.
