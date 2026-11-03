import { backendFetch } from "@/lib/server/backend";
import { isSameOriginMutation, readProvisionedServerAuth } from "@/lib/server/auth-session";
import { toPublicUserProfile } from "@/lib/server/user-profile";
import { NextResponse } from "next/server";

const jsonHeaders = { "Cache-Control": "no-store" };

/** Same-origin BFF: browser never receives the upstream bearer token. */
export async function GET(request: Request) {
  const auth = await readProvisionedServerAuth(request);
  if (!auth) {
    return NextResponse.json({ detail: "An active NetHub account is required" }, { status: 401, headers: jsonHeaders });
  }

  try {
    const response = await backendFetch("/users/me", {
      accessToken: auth.accessToken,
      method: "GET",
    });
    const raw: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { detail: response.status === 403 ? "Account is disabled" : "Unable to load account profile" },
        { status: response.status, headers: jsonHeaders },
      );
    }

    const validated = toPublicUserProfile(raw);
    if (!validated.ok) {
      return NextResponse.json(
        { detail: validated.detail },
        { status: validated.status, headers: jsonHeaders },
      );
    }
    return NextResponse.json(validated.data, { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error("[BFF] GET /users/me failed:", error);
    return NextResponse.json({ detail: "Account service unavailable" }, { status: 502, headers: jsonHeaders });
  }
}

export async function PATCH(request: Request) {
  if (!isSameOriginMutation(request)) {
    return NextResponse.json({ detail: "Cross-origin request rejected" }, { status: 403, headers: jsonHeaders });
  }
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
    return NextResponse.json({ detail: "Content-Type must be application/json" }, { status: 415, headers: jsonHeaders });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 8192) {
    return NextResponse.json({ detail: "Request body is too large" }, { status: 413, headers: jsonHeaders });
  }

  const auth = await readProvisionedServerAuth(request);
  if (!auth) {
    return NextResponse.json({ detail: "An active NetHub account is required" }, { status: 401, headers: jsonHeaders });
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).byteLength > 8192) {
      return NextResponse.json({ detail: "Request body is too large" }, { status: 413, headers: jsonHeaders });
    }
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return NextResponse.json({ detail: "Invalid JSON body" }, { status: 400, headers: jsonHeaders });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    Object.keys(body).length !== 1 ||
    !("full_name" in body) ||
    typeof body.full_name !== "string" ||
    !body.full_name.trim() ||
    body.full_name.trim().length > 120
  ) {
    return NextResponse.json({ detail: "Only a non-empty full_name (maximum 120 characters) can be updated" }, { status: 422, headers: jsonHeaders });
  }

  try {
    const response = await backendFetch("/users/me", {
      accessToken: auth.accessToken,
      method: "PATCH",
      body: { full_name: body.full_name.trim() },
    });
    const raw: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        { detail: "Unable to update account profile" },
        { status: response.status, headers: jsonHeaders },
      );
    }

    const validated = toPublicUserProfile(raw);
    if (!validated.ok) {
      return NextResponse.json(
        { detail: validated.detail },
        { status: validated.status, headers: jsonHeaders },
      );
    }
    return NextResponse.json(validated.data, { status: 200, headers: jsonHeaders });
  } catch (error) {
    console.error("[BFF] PATCH /users/me failed:", error);
    return NextResponse.json({ detail: "Account service unavailable" }, { status: 502, headers: jsonHeaders });
  }
}
