import assert from "node:assert/strict";
import test from "node:test";
import {
  InfrastructureConfigurationError,
  loadStripeCatalogRuntimeConfig
} from "./runtime-config";

test("loadStripeCatalogRuntimeConfig loads the full MVP catalog surface", () => {
  const config = loadStripeCatalogRuntimeConfig({
    STRIPE_PRO_MONTHLY_PRICE_ID: "price_pro_monthly",
    STRIPE_PRO_PRODUCT_ID: "prod_pro",
    STRIPE_PRO_YEARLY_PRICE_ID: "price_pro_yearly",
    STRIPE_STARTER_MONTHLY_PRICE_ID: "price_starter_monthly",
    STRIPE_STARTER_PRODUCT_ID: "prod_starter",
    STRIPE_STARTER_YEARLY_PRICE_ID: "price_starter_yearly",
    STRIPE_ULTRA_MONTHLY_PRICE_ID: "price_ultra_monthly",
    STRIPE_ULTRA_PRODUCT_ID: "prod_ultra",
    STRIPE_ULTRA_YEARLY_PRICE_ID: "price_ultra_yearly"
  });

  assert.deepEqual(config, {
    pro: {
      monthlyPriceId: "price_pro_monthly",
      productId: "prod_pro",
      yearlyPriceId: "price_pro_yearly"
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
  });
});

test("loadStripeCatalogRuntimeConfig fails when a required catalog id is missing", () => {
  assert.throws(
    () =>
      loadStripeCatalogRuntimeConfig({
        STRIPE_PRO_MONTHLY_PRICE_ID: "price_pro_monthly",
        STRIPE_PRO_PRODUCT_ID: "prod_pro",
        STRIPE_PRO_YEARLY_PRICE_ID: "price_pro_yearly",
        STRIPE_STARTER_MONTHLY_PRICE_ID: "price_starter_monthly",
        STRIPE_STARTER_PRODUCT_ID: "prod_starter",
        STRIPE_STARTER_YEARLY_PRICE_ID: "price_starter_yearly",
        STRIPE_ULTRA_MONTHLY_PRICE_ID: "price_ultra_monthly",
        STRIPE_ULTRA_YEARLY_PRICE_ID: "price_ultra_yearly"
      }),
    (error: unknown) => {
      assert.ok(error instanceof InfrastructureConfigurationError);
      assert.match(error.message, /STRIPE_ULTRA_PRODUCT_ID/);
      return true;
    }
  );
});
