import assert from "node:assert/strict";
import test from "node:test";
import type Stripe from "stripe";
import { StripeEventNormalizer } from "./stripe-event-normalizer.js";
import { createTestCatalogPlanBindings } from "../testing/test-helpers.js";

const normalizer = new StripeEventNormalizer({
  catalogPlanBindings: createTestCatalogPlanBindings()
});

test("StripeEventNormalizer maps checkout session metadata into the core contract", () => {
  const event = {
    created: 1_772_503_200,
    data: {
      object: {
        client_reference_id: "user_checkout",
        customer: "cus_checkout",
        metadata: {
          billingInterval: "MONTHLY",
          localUserId: "user_checkout",
          planLookupKey: "pro-monthly",
          planTier: "PRO",
          stripePriceId: "price_pro_monthly",
          stripeProductId: "prod_pro_monthly"
        },
        payment_status: "paid",
        subscription: "sub_checkout"
      }
    },
    id: "evt_checkout",
    type: "checkout.session.completed"
  } as unknown as Stripe.Event;

  const normalized = normalizer.normalize({
    event,
    receivedAt: new Date("2026-03-03T13:00:01.000Z")
  });

  assert.equal(normalized?.type, "checkout.session.completed");
  assert.equal(normalized?.subscription?.localUserId, "user_checkout");
  assert.equal(normalized?.subscription?.planTier, "PRO");
  assert.equal(normalized?.subscription?.stripeStatus, "ACTIVE");
  assert.equal(normalized?.subscription?.stripeSubscriptionId, "sub_checkout");
});

test("StripeEventNormalizer maps invoice.paid events into access-extension snapshots", () => {
  const event = {
    created: 1_772_503_200,
    data: {
      object: {
        customer: "cus_invoice",
        lines: {
          data: [
            {
              period: {
                end: 1_775_095_200,
                start: 1_772_503_200
              },
              pricing: {
                price_details: {
                  price: "price_pro_monthly",
                  product: "prod_pro_monthly"
                },
                type: "price_details",
                unit_amount_decimal: "1900"
              },
              subscription: "sub_invoice"
            }
          ]
        },
        metadata: null,
        parent: {
          quote_details: null,
          subscription_details: {
            metadata: {
              billingInterval: "MONTHLY",
              localUserId: "user_invoice",
              planLookupKey: "pro-monthly",
              planTier: "PRO",
              stripePriceId: "price_pro_monthly",
              stripeProductId: "prod_pro_monthly"
            },
            subscription: "sub_invoice",
            subscription_proration_date: 1_772_503_200
          },
          type: "subscription_details"
        },
        period_end: 1_775_095_200
      }
    },
    id: "evt_invoice_paid",
    type: "invoice.paid"
  } as unknown as Stripe.Event;

  const normalized = normalizer.normalize({
    event,
    receivedAt: new Date("2026-03-03T13:05:00.000Z")
  });

  assert.equal(normalized?.type, "invoice.paid");
  assert.equal(normalized?.subscription?.localUserId, "user_invoice");
  assert.equal(
    normalized?.subscription?.accessPeriodEnd?.toISOString(),
    "2026-04-02T02:00:00.000Z"
  );
  assert.equal(normalized?.subscription?.stripeStatus, "ACTIVE");
});

test("StripeEventNormalizer ignores unsupported event types", () => {
  const event = {
    created: 1_772_503_200,
    data: {
      object: {}
    },
    id: "evt_ignore",
    type: "charge.refunded"
  } as unknown as Stripe.Event;

  const normalized = normalizer.normalize({
    event
  });

  assert.equal(normalized, null);
});
