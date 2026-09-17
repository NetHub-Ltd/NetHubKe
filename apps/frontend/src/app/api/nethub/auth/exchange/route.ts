import { auth } from "@/auth";
import { backendFetch } from "@/lib/server/backend";
import { NextResponse } from "next/server";

/**
 * BFF: browser → POST /api/nethub/auth/exchange → FastAPI /api/v1/auth/exchange
 * Session bearer is applied server-side; client never sees BACKEND_URL.
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.accessToken || session.error) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const res = await backendFetch("/auth/exchange", {
      accessToken: session.accessToken,
      method: "POST",
      body,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[BFF] POST /auth/exchange", e);
    return NextResponse.json(
      { detail: "Upstream unavailable" },
      { status: 502 },
    );
  }
}
