import { NextResponse } from "next/server";

const MAX_TEXT_LENGTH = 5000;

function getBackendBaseUrl(): string | undefined {
  return process.env.NETHUB_API_URL?.replace(/\/$/, "");
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request" }, { status: 400 });
  }

  if (typeof payload !== "object" || payload === null) {
    return NextResponse.json({ detail: "Invalid request" }, { status: 400 });
  }

  const data = payload as Record<string, unknown>;
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const company = typeof data.company === "string" ? data.company.trim() : "";
  const service = typeof data.service === "string" ? data.service.trim() : "";
  const message = typeof data.message === "string" ? data.message.trim() : "";

  if (!name || !email || !message) {
    return NextResponse.json({ detail: "Name, email address and message are required" }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ detail: "Enter a valid email address" }, { status: 400 });
  }

  if (name.length > 200 || email.length > 320 || company.length > 200 || service.length > 200 || message.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ detail: "One or more fields exceed the allowed length" }, { status: 400 });
  }

  const backendBaseUrl = getBackendBaseUrl();
  if (!backendBaseUrl) {
    return NextResponse.json({ detail: "Enquiries are temporarily unavailable" }, { status: 503 });
  }

  try {
    const backendResponse = await fetch(`${backendBaseUrl}/api/v1/contact-enquiries`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        email,
        company: company || null,
        service: service || null,
        message,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });

    if (!backendResponse.ok) {
      if (backendResponse.status === 400) {
        return NextResponse.json({ detail: "Please check your details and try again" }, { status: 400 });
      }
      if (backendResponse.status === 429) {
        return NextResponse.json({ detail: "Too many enquiries have been submitted. Please try again later" }, { status: 429 });
      }
      return NextResponse.json({ detail: "We could not send your enquiry. Please try again shortly" }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ detail: "We could not send your enquiry. Please try again shortly" }, { status: 502 });
  }
}
