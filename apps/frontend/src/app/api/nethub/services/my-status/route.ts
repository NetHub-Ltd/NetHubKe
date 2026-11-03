import { backendFetch } from "@/lib/server/backend";
import { readProvisionedServerAuth } from "@/lib/server/auth-session";
import { NextResponse } from "next/server";

type PublicServiceStatus = {
  slug: string;
  name: string;
  status: "connected" | "trial" | "not_connected";
};

function toPublicServiceStatuses(value: unknown): PublicServiceStatus[] | null {
  if (!Array.isArray(value)) return null;

  const rows: PublicServiceStatus[] = [];
  for (const item of value) {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return null;
    const row = item as Record<string, unknown>;
    if (
      typeof row.slug !== "string" ||
      typeof row.name !== "string" ||
      (row.status !== "connected" && row.status !== "trial" && row.status !== "not_connected")
    ) {
      return null;
    }
    // Do not expose external organization IDs or product audiences to browser code.
    rows.push({ slug: row.slug, name: row.name, status: row.status });
  }
  return rows;
}

export async function GET(request: Request) {
  const auth = await readProvisionedServerAuth(request);
  if (!auth) {
    return NextResponse.json({ detail: "An active NetHub account is required" }, {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    const response = await backendFetch("/services/my-status", {
      accessToken: auth.accessToken,
      method: "GET",
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ detail: "Unable to load service status" }, {
        status: response.status,
        headers: { "Cache-Control": "no-store" },
      });
    }

    const publicData = toPublicServiceStatuses(data);
    if (!publicData) {
      return NextResponse.json({ detail: "Invalid service status response" }, {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }
    return NextResponse.json(publicData, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[BFF] GET /services/my-status failed:", error);
    return NextResponse.json({ detail: "Service status unavailable" }, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
