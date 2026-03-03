import type { StripeWebhookQueueIntent } from "@stripe-access-management/core";

export const defaultStripeWebhookQueueName = "stripe-webhook-processing";

export interface StripeWebhookProcessingJob {
  inboxEventId: string;
  stripeEventId: string;
}

export function mapStripeWebhookIntentToJob(
  intent: StripeWebhookQueueIntent
): StripeWebhookProcessingJob {
  return {
    inboxEventId: intent.inboxEventId,
    stripeEventId: intent.stripeEventId
  };
}

export function mapStripeWebhookJobToIntent(
  job: StripeWebhookProcessingJob
): StripeWebhookQueueIntent {
  return {
    inboxEventId: job.inboxEventId,
    kind: "process-stripe-webhook",
    stripeEventId: job.stripeEventId
  };
}
