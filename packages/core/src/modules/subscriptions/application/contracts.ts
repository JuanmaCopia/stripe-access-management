import type { BillingInterval, PlanTier } from "../../catalog/domain/index";
import type { StripeSubscriptionStatus } from "../domain/index";
import type { JsonObject } from "../../../shared/kernel/index";

export const supportedStripeEventTypes = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
  "invoice.payment_action_required"
] as const;

export type StripeEventType = (typeof supportedStripeEventTypes)[number];

export interface NormalizedSubscriptionSnapshot {
  accessPeriodEnd: Date | null;
  billingInterval: BillingInterval;
  cancelAtPeriodEnd: boolean;
  localUserId: string;
  planTier: PlanTier;
  stripeCustomerId: string;
  stripePriceId: string;
  stripeProductId: string;
  stripeStatus: StripeSubscriptionStatus;
  stripeSubscriptionId: string;
}

export interface NormalizedStripeEvent {
  occurredAt: Date;
  payload: JsonObject;
  receivedAt: Date;
  stripeEventId: string;
  subscription: NormalizedSubscriptionSnapshot | null;
  type: StripeEventType;
}

export interface RecordedStripeWebhookEvent {
  id: string;
  payload: JsonObject;
  receivedAt: Date;
  stripeEventId: string;
  type: StripeEventType;
}

export interface StripeWebhookQueueIntent {
  inboxEventId: string;
  kind: "process-stripe-webhook";
  stripeEventId: string;
}
