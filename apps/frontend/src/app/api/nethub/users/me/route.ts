import { auth } from "@/auth";
import { backendFetch } from "@/lib/server/backend";
import { toPublicUserProfile } from "@/lib/server/user-profile";
import { NextResponse } from "next/server";

/**
 * BFF: browser → /api/nethub/users/me → FastAPI /api/v1/users/me
 *
 * - Requires a valid Auth.js session + access token
 * - Zod-validates upstream body
 * - Returns only the public profile fields (no tokens / extra claims)
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
    const raw = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        typeof raw === "object" && raw && "detail" in raw
          ? raw
          : { detail: "Failed to load profile" },
        { status: res.status },
      );
    }

    const validated = toPublicUserProfile(raw);
    if (!validated.ok) {
      return NextResponse.json(
        { detail: validated.detail },
        { status: validated.status },
      );
    }
    return NextResponse.json(validated.data, { status: 200 });
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
    const raw = await res.json().catch(() => null);

    if (!res.ok) {
      return NextResponse.json(
        typeof raw === "object" && raw && "detail" in raw
          ? raw
          : { detail: "Failed to update profile" },
        { status: res.status },
      );
    }

    const validated = toPublicUserProfile(raw);
    if (!validated.ok) {
      return NextResponse.json(
        { detail: validated.detail },
        { status: validated.status },
      );
    }
    return NextResponse.json(validated.data, { status: 200 });
  } catch (e) {
    console.error("[BFF] PATCH /users/me", e);
    return NextResponse.json(
      { detail: "Upstream unavailable" },
      { status: 502 },
    );
  }
}
