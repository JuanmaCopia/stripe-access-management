import assert from "node:assert/strict";
import test from "node:test";
import { InfrastructureConfigurationError } from "../config/index";
import { createTestStripeCatalogRuntimeConfig } from "../testing/test-helpers";
import {
  buildStripeCatalogPlanBindings,
  resolveStripeCatalogPlanBinding
} from "./stripe-catalog";

test("buildStripeCatalogPlanBindings produces the six supported MVP bindings", () => {
  const bindings = buildStripeCatalogPlanBindings(
    createTestStripeCatalogRuntimeConfig()
  );

  assert.equal(bindings.length, 6);
  assert.deepEqual(
    bindings.map((binding) => binding.lookupKey),
    [
      "starter-monthly",
      "starter-yearly",
      "pro-monthly",
      "pro-yearly",
      "ultra-monthly",
      "ultra-yearly"
    ]
  );
});

test("buildStripeCatalogPlanBindings rejects duplicate Stripe price identifiers", () => {
  assert.throws(
    () =>
      buildStripeCatalogPlanBindings({
        pro: {
          monthlyPriceId: "price_pro_monthly",
          productId: "prod_pro",
          yearlyPriceId: "price_pro_monthly"
        },
        starter: {
          monthlyPriceId: "price_starter_monthly",
          productId: "prod_starter",
          yearlyPriceId: "price_starter_yearly"
        },
        ultra: {
          monthlyPriceId: "price_ultra_monthly",
          productId: "prod_ultra",
          yearlyPriceId: "price_ultra_yearly"
        }
      }),
    (error: unknown) => {
      assert.ok(error instanceof InfrastructureConfigurationError);
      assert.match(error.message, /Duplicate Stripe catalog binding price id/);
      return true;
    }
  );
});

test("resolveStripeCatalogPlanBinding resolves selections and refuses ambiguous product-only lookups", () => {
  const bindings = buildStripeCatalogPlanBindings(
    createTestStripeCatalogRuntimeConfig()
  );

  const selectionBinding = resolveStripeCatalogPlanBinding({
    bindings,
    selection: {
      billingInterval: "YEARLY",
      tier: "ULTRA"
    }
  });
  const productOnlyBinding = resolveStripeCatalogPlanBinding({
    bindings,
    stripeProductId: "prod_pro"
  });

  assert.equal(selectionBinding?.lookupKey, "ultra-yearly");
  assert.equal(selectionBinding?.stripePriceId, "price_ultra_yearly");
  assert.equal(productOnlyBinding, null);
});
