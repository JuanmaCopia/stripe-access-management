import assert from "node:assert/strict";
import test from "node:test";
import { POST as checkoutPOST } from "../../app/api/checkout/route";
import { POST as portalPOST } from "../../app/api/portal/route";

process.env.AUTH_SECRET = "test-secret-for-auth";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";

test("checkout route returns 401 when unauthenticated", async () => {
  const request = new Request("http://localhost:3000/api/checkout", {
    method: "POST"
  });

  const response = await checkoutPOST(request);
  assert.equal(response.status, 401);
});

test("portal route returns 401 when unauthenticated", async () => {
  const request = new Request("http://localhost:3000/api/portal", {
    method: "POST"
  });

  const response = await portalPOST(request);
  assert.equal(response.status, 401);
});
