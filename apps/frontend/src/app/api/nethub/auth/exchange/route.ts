import { NextResponse } from "next/server";

/**
 * Product-token handoff is intentionally disabled.
 *
 * Returning a product JWT from a browser-facing BFF or placing it in a URL
 * fragment exposes a bearer credential to browser JavaScript. Re-enable only
 * after a one-time launch-code flow is implemented and redeemed server-side.
 */
export async function POST() {
  return NextResponse.json(
    { detail: "Product launch is unavailable until secure server-to-server launch-code redemption is implemented" },
    {
      status: 410,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
