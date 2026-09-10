import { auth } from "@/auth";
import { backendFetch } from "@/lib/server/backend";
import { NextResponse } from "next/server";

/**
 * BFF: browser → /api/nethub/users/me → FastAPI /api/v1/users/me
 * Does not expose BACKEND_URL to the client.
 */
export async function GET() {
  const session = await auth();
  if (!session?.accessToken || session.error) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await backendFetch("/users/me", {
      accessToken: session.accessToken,
      method: "GET",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[BFF] GET /users/me", e);
    return NextResponse.json(
      { detail: "Upstream unavailable" },
      { status: 502 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.accessToken || session.error) {
    return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const res = await backendFetch("/users/me", {
      accessToken: session.accessToken,
      method: "PATCH",
      body,
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("[BFF] PATCH /users/me", e);
    return NextResponse.json(
      { detail: "Upstream unavailable" },
      { status: 502 },
    );
  }
}
