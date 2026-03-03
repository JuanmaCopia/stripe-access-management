import assert from "node:assert/strict";
import test from "node:test";

import { evaluateArticleAccess } from "./access-policy";
import type { SubscriptionRecord } from "../../subscriptions/domain/index";

function createSubscription(
  overrides: Partial<SubscriptionRecord> = {}
): SubscriptionRecord {
  return {
    accessExpiresAt: new Date("2026-04-01T00:00:00.000Z"),
    billingInterval: "MONTHLY",
    cancelAtPeriodEnd: false,
    id: "sub_123",
    lastSyncedAt: new Date("2026-03-01T00:00:00.000Z"),
    planTier: "PRO",
    stripeCustomerId: "cus_123",
    stripePriceId: "price_123",
    stripeProductId: "prod_123",
    stripeStatus: "ACTIVE",
    stripeSubscriptionId: "stripe_sub_123",
    userId: "user_123",
    ...overrides
  };
}

test("evaluateArticleAccess unlocks inherited content for an active subscription", () => {
  const result = evaluateArticleAccess({
    isAuthenticated: true,
    now: new Date("2026-03-03T00:00:00.000Z"),
    requiredTier: "STARTER",
    subscription: createSubscription()
  });

  assert.deepEqual(result, {
    allowed: true,
    reason: "granted"
  });
});

test("evaluateArticleAccess denies access when the paid-through period has expired", () => {
  const result = evaluateArticleAccess({
    isAuthenticated: true,
    now: new Date("2026-05-01T00:00:00.000Z"),
    requiredTier: "STARTER",
    subscription: createSubscription()
  });

  assert.deepEqual(result, {
    allowed: false,
    reason: "access_expired"
  });
});

test("evaluateArticleAccess denies access when the plan tier is too low", () => {
  const result = evaluateArticleAccess({
    isAuthenticated: true,
    now: new Date("2026-03-03T00:00:00.000Z"),
    requiredTier: "ULTRA",
    subscription: createSubscription()
  });

  assert.deepEqual(result, {
    allowed: false,
    reason: "insufficient_tier"
  });
});
