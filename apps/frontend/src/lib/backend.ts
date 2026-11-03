/**
 * Server-only calls to NetHubKe resource server (Architecture A).
 * Always: Authorization: Bearer <IdP access token>
 */

const base = () => {
  const url = process.env.NETHUB_API_URL;
  if (!url) {
    throw new Error("NETHUB_API_URL is not configured");
  }
  return url.replace(/\/$/, "");
};

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
  accessToken: string,
  init?: RequestInit
): Promise<Response> {
  return fetch(`${base()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
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
    // First visit: provision then read
    return syncUser(accessToken);
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`me failed: ${res.status} ${text}`);
  }
  return res.json() as Promise<NetHubUser>;
}
