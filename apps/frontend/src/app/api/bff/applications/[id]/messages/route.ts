import { auth } from "@/auth";
import { postUserMessage } from "@/lib/applications";
import { NextResponse } from "next/server";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const { body } = await req.json();
    const data = await postUserMessage(id, body);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { detail: e instanceof Error ? e.message : "error" },
      { status: 502 }
    );
  }
}
