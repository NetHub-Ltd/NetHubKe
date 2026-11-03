import test from "node:test";
import assert from "node:assert/strict";
import { isSameOriginMutation } from "../src/lib/server/auth-session-policy.ts";

test("accepts same-origin cookie-authenticated mutations", () => {
  const request = new Request("https://nethub.co.ke/api/nethub/users/me", {
    method: "PATCH",
    headers: {
      Origin: "https://nethub.co.ke",
      "Sec-Fetch-Site": "same-origin",
    },
  });
  assert.equal(isSameOriginMutation(request), true);
});

test("rejects a foreign Origin", () => {
  const request = new Request("https://nethub.co.ke/api/nethub/users/me", {
    method: "PATCH",
    headers: { Origin: "https://attacker.example" },
  });
  assert.equal(isSameOriginMutation(request), false);
});

test("rejects a missing Origin on cookie-authenticated mutations", () => {
  const request = new Request("https://nethub.co.ke/api/nethub/users/me", {
    method: "PATCH",
  });
  assert.equal(isSameOriginMutation(request), false);
});

test("rejects cross-site fetch metadata even when Origin matches", () => {
  const request = new Request("https://nethub.co.ke/api/nethub/users/me", {
    method: "PATCH",
    headers: {
      Origin: "https://nethub.co.ke",
      "Sec-Fetch-Site": "cross-site",
    },
  });
  assert.equal(isSameOriginMutation(request), false);
});
