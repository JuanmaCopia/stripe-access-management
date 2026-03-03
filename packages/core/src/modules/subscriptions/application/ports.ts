import type { CatalogPlan } from "../../catalog/domain/index";
import type { UserIdentity } from "../../identity/domain/index";
import type {
  NormalizedStripeEvent,
  RecordedStripeWebhookEvent,
  StripeWebhookQueueIntent
} from "./contracts";
import type {
  SubscriptionProjection,
  SubscriptionRecord
} from "../domain/index";

export interface SubscriptionRepository {
  findByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<SubscriptionRecord | null>;
  findByUserId(userId: string): Promise<SubscriptionRecord | null>;
  upsertProjection(
    subscription: SubscriptionProjection
  ): Promise<SubscriptionRecord>;
}

export interface BillingGateway {
  createBillingPortalSession(input: {
    returnUrl: string;
    user: UserIdentity;
  }): Promise<{
    billingPortalUrl: string;
  }>;
  createCheckoutSession(input: {
    cancelUrl: string;
    existingSubscription: SubscriptionRecord | null;
    plan: CatalogPlan;
    successUrl: string;
    user: UserIdentity;
  }): Promise<{
    checkoutSessionId: string;
    checkoutSessionUrl: string;
  }>;
}

export interface WebhookInboxRepository {
  findByStripeEventId(
    stripeEventId: string
  ): Promise<RecordedStripeWebhookEvent | null>;
  record(event: NormalizedStripeEvent): Promise<RecordedStripeWebhookEvent>;
}

export interface QueuePublisher {
  publishStripeWebhookProcessing(
    intent: StripeWebhookQueueIntent
  ): Promise<void>;
}
