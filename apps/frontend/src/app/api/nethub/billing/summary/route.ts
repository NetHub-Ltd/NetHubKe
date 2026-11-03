import { backendFetch } from "@/lib/server/backend";
import { readProvisionedServerAuth } from "@/lib/server/auth-session";
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
    const response = await backendFetch("/billing/summary", {
      accessToken: auth.accessToken,
      method: "GET",
    });
    const data: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ detail: "Unable to load billing summary" }, {
        status: response.status,
        headers: { "Cache-Control": "no-store" },
      });
    }
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return NextResponse.json({ detail: "Invalid billing response" }, {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      });
    }
    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("[BFF] GET /billing/summary failed:", error);
    return NextResponse.json({ detail: "Billing service unavailable" }, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
