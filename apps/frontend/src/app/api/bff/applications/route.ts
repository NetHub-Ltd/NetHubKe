import { auth } from "@/auth";
import { createApplication } from "@/lib/applications";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data = await createApplication(body);
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "error";
    return NextResponse.json({ detail: message }, { status: 502 });
  }
}
