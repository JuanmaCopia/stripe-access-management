import assert from "node:assert/strict";
import test from "node:test";
import { POST as webhookPOST } from "../../app/api/webhooks/stripe/route";

process.env.AUTH_SECRET = "test-secret";
process.env.STRIPE_SECRET_KEY = "sk_test_123";
process.env.STRIPE_STARTER_MONTHLY_PRICE_ID = "price_1";
process.env.STRIPE_STARTER_YEARLY_PRICE_ID = "price_2";
process.env.STRIPE_PRO_MONTHLY_PRICE_ID = "price_3";
process.env.STRIPE_PRO_YEARLY_PRICE_ID = "price_4";
process.env.STRIPE_ULTRA_MONTHLY_PRICE_ID = "price_5";
process.env.STRIPE_ULTRA_YEARLY_PRICE_ID = "price_6";

test("webhook route returns 500 when STRIPE_WEBHOOK_SECRET is missing", async () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
  delete process.env.STRIPE_WEBHOOK_SECRET;

  const request = new Request("http://localhost:3000/api/webhooks/stripe", {
    body: "test_body",
    headers: { "stripe-signature": "test_signature" },
    method: "POST"
  });

  const response = await webhookPOST(request);
  assert.equal(response.status, 500);

  if (originalSecret) {
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  }
});

test("webhook route returns 400 when stripe-signature header is missing", async () => {
  process.env.STRIPE_WEBHOOK_SECRET = "test_secret";

  const request = new Request("http://localhost:3000/api/webhooks/stripe", {
    body: "test_body",
    method: "POST"
  });

  const response = await webhookPOST(request);
  assert.equal(response.status, 400);
});

test("webhook route returns 400 when signature is invalid", async () => {
  process.env.STRIPE_WEBHOOK_SECRET = "test_secret";

  const request = new Request("http://localhost:3000/api/webhooks/stripe", {
    body: "test_body",
    headers: { "stripe-signature": "invalid_signature" },
    method: "POST"
  });

  const response = await webhookPOST(request);
  assert.equal(response.status, 400);
});
