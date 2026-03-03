import type { BillingInterval, PlanSelection, PlanTier } from "../../catalog/domain/index";
import { isSamePlanSelection } from "../../catalog/domain/index";
import {
  allowsAccessUntilExpiry,
  type StripeSubscriptionStatus
} from "./stripe-subscription-status";

export interface SubscriptionProjection {
  accessExpiresAt: Date | null;
  billingInterval: BillingInterval;
  cancelAtPeriodEnd: boolean;
  lastSyncedAt: Date | null;
  planTier: PlanTier;
  stripeCustomerId: string;
  stripePriceId: string;
  stripeProductId: string;
  stripeStatus: StripeSubscriptionStatus;
  stripeSubscriptionId: string;
  userId: string;
}

export interface SubscriptionRecord extends SubscriptionProjection {
  id: string;
}

export function hasActivePaidAccess(
  subscription: SubscriptionProjection,
  now: Date
): boolean {
  if (!subscription.accessExpiresAt) {
    return false;
  }

  if (subscription.accessExpiresAt <= now) {
    return false;
  }

  return allowsAccessUntilExpiry(subscription.stripeStatus);
}

export function matchesPlanSelection(
  subscription: SubscriptionProjection,
  selection: PlanSelection
): boolean {
  return isSamePlanSelection(
    {
      billingInterval: subscription.billingInterval,
      tier: subscription.planTier
    },
    selection
  );
}
