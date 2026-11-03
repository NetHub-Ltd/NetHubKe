/**
 * Server-only calls to NetHubKe resource server (Architecture A).
 */

const base = () => {
  const url = process.env.NETHUB_API_URL;
  if (!url) {
    throw new Error("NETHUB_API_URL is not configured");
  }
  return url.replace(/\/$/, "");
};

export function getBackendBaseUrl(): string | undefined {
  return process.env.NETHUB_API_URL?.replace(/\/$/, "");
}

export type NetHubUser = {
  id: string;
  email: string;
  username: string;
  full_name: string;
  is_active: boolean;
  tenant_id?: string | null;
};

async function backendFetch(
  path: string,
  accessToken: string | undefined,
  init?: RequestInit
): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return fetch(`${base()}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}

export async function syncUser(accessToken: string): Promise<NetHubUser> {
  const res = await backendFetch("/api/v1/users/sync", accessToken, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`sync failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<NetHubUser>;
}

export async function getMe(accessToken: string): Promise<NetHubUser> {
  const res = await backendFetch("/api/v1/users/me", accessToken);
  if (res.status === 404) {
    return syncUser(accessToken);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`me failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<NetHubUser>;
}

export type ProbeResult = {
  ok: boolean;
  status?: number;
  body?: unknown;
  error?: string;
  url: string;
  ms: number;
};

export async function probeBackend(path: string): Promise<ProbeResult> {
  const url = `${base()}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      /* keep text */
    }
    return {
      ok: res.ok,
      status: res.status,
      body,
      url,
      ms: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      url,
      ms: Date.now() - start,
    };
  }
}
