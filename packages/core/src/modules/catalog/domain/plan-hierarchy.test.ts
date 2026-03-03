import assert from "node:assert/strict";
import test from "node:test";

import {
  comparePlanTier,
  satisfiesRequiredTier
} from "./plan-hierarchy.js";

test("comparePlanTier orders Starter, Pro, and Ultra from lowest to highest", () => {
  assert.equal(comparePlanTier("STARTER", "PRO") < 0, true);
  assert.equal(comparePlanTier("PRO", "ULTRA") < 0, true);
  assert.equal(comparePlanTier("ULTRA", "STARTER") > 0, true);
});

test("satisfiesRequiredTier honors inherited access across tiers", () => {
  assert.equal(satisfiesRequiredTier("PRO", "STARTER"), true);
  assert.equal(satisfiesRequiredTier("ULTRA", "PRO"), true);
  assert.equal(satisfiesRequiredTier("STARTER", "ULTRA"), false);
});
