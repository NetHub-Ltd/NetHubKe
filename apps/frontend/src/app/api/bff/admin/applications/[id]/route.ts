import { auth } from "@/auth";
import { adminSetStatus } from "@/lib/applications";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const { status } = await req.json();
    return NextResponse.json(await adminSetStatus(id, status));
  } catch (e) {
    return NextResponse.json({ detail: e instanceof Error ? e.message : "error" }, { status: 502 });
  }
}
