export const stripeSubscriptionStatuses = [
  "INCOMPLETE",
  "INCOMPLETE_EXPIRED",
  "TRIALING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
  "UNPAID",
  "PAUSED"
] as const;

export type StripeSubscriptionStatus =
  (typeof stripeSubscriptionStatuses)[number];

const accessEligibleStatuses = new Set<StripeSubscriptionStatus>([
  "ACTIVE",
  "PAST_DUE",
  "TRIALING"
]);

export function allowsAccessUntilExpiry(
  status: StripeSubscriptionStatus
): boolean {
  return accessEligibleStatuses.has(status);
}
