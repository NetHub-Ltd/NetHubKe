import { auth } from "@/auth";
import { backendFetch } from "@/lib/server/backend";
import { NextResponse } from "next/server";

/**
 * BFF: GET /api/nethub/billing/summary → FastAPI /api/v1/billing/summary
 */
export async function GET() {
  const session = await auth();
  if (!session?.accessToken || session.error) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await backendFetch("/billing/summary", {
      accessToken: session.accessToken,
      method: "GET",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[BFF] GET /billing/summary", e);
    return NextResponse.json(
      { detail: "Upstream unavailable" },
      { status: 502 },
    );
  }
}
