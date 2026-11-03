import test from "node:test";
import assert from "node:assert/strict";
import { isLaunchHopEnabled, productLaunchBaseUrl } from "../src/lib/launch/launchHop.ts";

test("client-side product launch cannot be enabled by an environment flag", () => {
  assert.equal(isLaunchHopEnabled(), false);
  assert.equal(productLaunchBaseUrl("tawala"), null);
});
