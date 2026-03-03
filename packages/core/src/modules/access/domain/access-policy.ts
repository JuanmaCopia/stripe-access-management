import { satisfiesRequiredTier, type PlanTier } from "../../catalog/domain/index";
import {
  hasActivePaidAccess,
  type SubscriptionRecord
} from "../../subscriptions/domain/index";

export type ArticleAccessDeniedReason =
  | "access_expired"
  | "insufficient_tier"
  | "missing_subscription"
  | "subscription_inactive"
  | "unauthenticated";

export type ArticleAccessDecision =
  | {
      allowed: true;
      reason: "granted";
    }
  | {
      allowed: false;
      reason: ArticleAccessDeniedReason;
    };

export interface EvaluateArticleAccessInput {
  isAuthenticated: boolean;
  now: Date;
  requiredTier: PlanTier;
  subscription: SubscriptionRecord | null;
}

export function evaluateArticleAccess(
  input: EvaluateArticleAccessInput
): ArticleAccessDecision {
  if (!input.isAuthenticated) {
    return {
      allowed: false,
      reason: "unauthenticated"
    };
  }

  if (!input.subscription) {
    return {
      allowed: false,
      reason: "missing_subscription"
    };
  }

  if (!input.subscription.accessExpiresAt) {
    return {
      allowed: false,
      reason: "missing_subscription"
    };
  }

  if (input.subscription.accessExpiresAt <= input.now) {
    return {
      allowed: false,
      reason: "access_expired"
    };
  }

  if (!hasActivePaidAccess(input.subscription, input.now)) {
    return {
      allowed: false,
      reason: "subscription_inactive"
    };
  }

  if (!satisfiesRequiredTier(input.subscription.planTier, input.requiredTier)) {
    return {
      allowed: false,
      reason: "insufficient_tier"
    };
  }

  return {
    allowed: true,
    reason: "granted"
  };
}
