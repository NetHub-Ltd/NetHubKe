import test from "node:test";
import assert from "node:assert/strict";
import { getProvisionedAuthContext, isSameOriginMutation } from "../src/lib/server/auth-session-policy.ts";

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


test("allows BFF access only for a synchronized active canonical user", () => {
  assert.deepEqual(
    getProvisionedAuthContext({
      accessToken: "upstream-token",
      backendSynced: true,
      user: { id: "canonical-user", isActive: true },
    }),
    { accessToken: "upstream-token", userId: "canonical-user" },
  );
});

test("rejects missing, expired, inactive and unprovisioned sessions", () => {
  assert.equal(getProvisionedAuthContext(null), null);
  assert.equal(getProvisionedAuthContext({ backendSynced: true, user: { id: "u", isActive: true } }), null);
  assert.equal(getProvisionedAuthContext({ accessToken: "t", backendSynced: false, user: { id: "u", isActive: true } }), null);
  assert.equal(getProvisionedAuthContext({ accessToken: "t", backendSynced: true, user: { id: "u", isActive: false } }), null);
  assert.equal(getProvisionedAuthContext({ accessToken: "t", backendSynced: true, error: "RefreshAccessTokenError", user: { id: "u", isActive: true } }), null);
});
