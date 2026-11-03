import { backendFetch } from "@/lib/server/backend";
import { readProvisionedServerAuth } from "@/lib/server/auth-session";
import { toPublicServiceStatuses } from "@/lib/server/service-status";
import { NextResponse } from "next/server";

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
