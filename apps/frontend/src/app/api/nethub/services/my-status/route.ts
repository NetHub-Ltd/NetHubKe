import { auth } from "@/auth";
import { backendFetch } from "@/lib/server/backend";
import { NextResponse } from "next/server";

/**
 * BFF: browser → /api/nethub/services/my-status → FastAPI /api/v1/services/my-status
 * Does not expose BACKEND_URL to the client.
 */
export async function GET() {
  const session = await auth();
  if (!session?.accessToken || session.error) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await backendFetch("/services/my-status", {
      accessToken: session.accessToken,
      method: "GET",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[BFF] GET /services/my-status", e);
    return NextResponse.json(
      { detail: "Upstream unavailable" },
      { status: 502 },
    );
  }
}
