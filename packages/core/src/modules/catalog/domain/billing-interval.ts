export const billingIntervals = ["MONTHLY", "YEARLY"] as const;

export type BillingInterval = (typeof billingIntervals)[number];
