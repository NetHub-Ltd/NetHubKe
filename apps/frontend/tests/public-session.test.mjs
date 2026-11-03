import test from "node:test";
import assert from "node:assert/strict";
import { toPublicSession } from "../src/lib/server/public-session.ts";

test("public session contains profile state but never bearer credentials", () => {
  const session = {
    expires: "2030-01-01T00:00:00.000Z",
    user: { name: "Old Name", email: "old@example.com" },
  };
  const token = {
    accessToken: "upstream-access-secret",
    refreshToken: "upstream-refresh-secret",
    idToken: "upstream-id-secret",
    productToken: "product-access-secret",
    backendSynced: true,
    user: {
      id: "user-123",
      tenantId: "tenant-123",
      isActive: true,
      email: "user@example.com",
      name: "NetHub User",
      username: "user",
      phoneNumber: null,
      tenantName: "Example tenant",
      tenantTier: "free",
      createdAt: "2026-01-01T00:00:00Z",
    },
  };

  const result = toPublicSession(session, token);

  assert.equal(result.backendSynced, true);
  assert.equal(result.user.id, "user-123");
  assert.equal(result.user.name, "NetHub User");
  assert.equal(result.accessToken, undefined);
  assert.equal(result.refreshToken, undefined);
  assert.equal(result.idToken, undefined);
  assert.equal(result.productToken, undefined);
  assert.equal(JSON.stringify(result).includes("upstream-access-secret"), false);
  assert.equal(JSON.stringify(result).includes("product-access-secret"), false);
});

test("refresh failure is exposed as a safe error without copying token data", () => {
  const session = { expires: "2030-01-01T00:00:00.000Z", user: { name: "User" } };
  const token = {
    accessToken: "must-not-leak",
    refreshToken: "must-not-leak-either",
    error: "RefreshAccessTokenError",
  };

  const result = toPublicSession(session, token);

  assert.equal(result.error, "RefreshAccessTokenError");
  assert.equal(result.accessToken, undefined);
  assert.equal(result.refreshToken, undefined);
  assert.equal(JSON.stringify(result).includes("must-not-leak"), false);
});
