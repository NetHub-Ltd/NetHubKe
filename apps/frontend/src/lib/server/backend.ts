/**
 * Server-only FastAPI client. Do not import from client components.
 * BACKEND_URL = API origin or origin+/api/v1.
 */

function apiBase(): string {
  const raw = process.env.BACKEND_URL?.replace(/\/$/, "") || "";
  if (!raw) {
    throw new Error("BACKEND_URL is not configured");
  }
  if (raw.endsWith("/api/v1")) return raw;
  return `${raw}/api/v1`;
}

export type BackendFetchInit = {
  accessToken?: string;
  method?: string;
  body?: unknown;
  searchParams?: Record<string, string>;
};

/** path under /api/v1, e.g. "/users/me" */
export async function backendFetch(
  path: string,
  init: BackendFetchInit = {},
): Promise<Response> {
  const base = apiBase();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${base}${normalized}`);
  if (init.searchParams) {
    for (const [k, v] of Object.entries(init.searchParams)) {
      url.searchParams.set(k, v);
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (init.accessToken) {
    headers.Authorization = `Bearer ${init.accessToken}`;
  }
  if (init.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(url.toString(), {
    method: init.method ?? (init.body !== undefined ? "POST" : "GET"),
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
}
