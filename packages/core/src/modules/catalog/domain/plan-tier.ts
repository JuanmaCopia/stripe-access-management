export const planTiers = ["STARTER", "PRO", "ULTRA"] as const;

export type PlanTier = (typeof planTiers)[number];
