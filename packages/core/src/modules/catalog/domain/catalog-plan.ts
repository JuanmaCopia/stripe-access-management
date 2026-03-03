import type { BillingInterval } from "./billing-interval";
import type { PlanTier } from "./plan-tier";

export interface PlanSelection {
  billingInterval: BillingInterval;
  tier: PlanTier;
}

export interface CatalogPlan extends PlanSelection {
  displayName: string;
  lookupKey: string;
}

export function isSamePlanSelection(
  left: PlanSelection,
  right: PlanSelection
): boolean {
  return left.tier === right.tier && left.billingInterval === right.billingInterval;
}
