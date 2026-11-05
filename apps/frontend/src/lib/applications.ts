import { getIdpAccessToken } from "@/lib/session-token";

const base = () => (process.env.NETHUB_API_URL || "").replace(/\/$/, "");

async function api(path: string, init?: RequestInit) {
  const token = await getIdpAccessToken();
  if (!token) throw new Error("Sign in required");
  const res = await fetch(`${base()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
}

export async function listServices() {
  const res = await fetch(`${base()}/api/v1/services`, { cache: "no-store" });
  if (!res.ok) throw new Error("Could not load services");
  return res.json();
}

export async function listMyApplications() {
  return api("/api/v1/applications");
}

export async function createApplication(body: Record<string, string>) {
  return api("/api/v1/applications", { method: "POST", body: JSON.stringify(body) });
}

export async function getApplication(id: string) {
  return api(`/api/v1/applications/${id}`);
}

export async function postUserMessage(id: string, body: string) {
  return api(`/api/v1/applications/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function adminListApplications() {
  return api("/api/v1/admin/applications");
}

export async function adminGetApplication(id: string) {
  return api(`/api/v1/admin/applications/${id}`);
}

export async function adminPostMessage(id: string, body: string) {
  return api(`/api/v1/admin/applications/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function adminSetStatus(id: string, status: string) {
  return api(`/api/v1/admin/applications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
