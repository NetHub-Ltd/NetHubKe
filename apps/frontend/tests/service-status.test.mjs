import test from "node:test";
import assert from "node:assert/strict";
import { toPublicServiceStatuses } from "../src/lib/server/service-status.ts";

test("service status response exposes only public product status fields", () => {
  const result = toPublicServiceStatuses([
    {
      slug: "tawala",
      name: "Tawala",
      status: "connected",
      external_org_id: "private-org-id",
      audience: "private-audience",
    },
  ]);

  assert.deepEqual(result, [{ slug: "tawala", name: "Tawala", status: "connected" }]);
  assert.equal(JSON.stringify(result).includes("private-org-id"), false);
  assert.equal(JSON.stringify(result).includes("private-audience"), false);
});

test("invalid service status payloads fail closed", () => {
  assert.equal(toPublicServiceStatuses({ slug: "tawala" }), null);
  assert.equal(toPublicServiceStatuses([{ slug: "tawala", name: "Tawala", status: "unknown" }]), null);
  assert.equal(toPublicServiceStatuses([{ slug: "tawala", name: 12, status: "connected" }]), null);
});
