import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../src/app/api/nethub/auth/exchange/route.ts";
import { isLaunchHopEnabled, productLaunchBaseUrl } from "../src/lib/launch/launchHop.ts";

test("browser product exchange is permanently disabled until server-side redemption exists", async () => {
  const response = await POST();
  assert.equal(response.status, 410);
  const body = await response.json();
  assert.equal(typeof body.detail, "string");
  assert.equal("access_token" in body, false);
});

test("client-side product launch cannot be enabled by an environment flag", () => {
  assert.equal(isLaunchHopEnabled(), false);
  assert.equal(productLaunchBaseUrl("tawala"), null);
});
