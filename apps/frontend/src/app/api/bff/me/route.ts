import { auth } from "@/auth";
import { getMe } from "@/lib/backend";
import { getIdpAccessToken } from "@/lib/session-token";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  }

  const accessToken = await getIdpAccessToken();
  if (!accessToken) {
    return NextResponse.json(
      { detail: "No IdP access token in session; sign in again" },
      { status: 401 }
    );
  }

  try {
    const user = await getMe(accessToken);
    return NextResponse.json(user);
  } catch (err) {
    const message = err instanceof Error ? err.message : "backend error";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
