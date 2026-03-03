import type { PlanTier } from "./plan-tier";

const planTierRank: Record<PlanTier, number> = {
  STARTER: 0,
  PRO: 1,
  ULTRA: 2
};

export function comparePlanTier(left: PlanTier, right: PlanTier): number {
  return planTierRank[left] - planTierRank[right];
}

export function satisfiesRequiredTier(
  userTier: PlanTier,
  requiredTier: PlanTier
): boolean {
  return comparePlanTier(userTier, requiredTier) >= 0;
}
