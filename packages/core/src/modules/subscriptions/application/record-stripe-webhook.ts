import type {
  NormalizedStripeEvent,
  StripeWebhookQueueIntent
} from "./contracts.js";
import type { QueuePublisher, WebhookInboxRepository } from "./ports.js";

export interface RecordStripeWebhookInput {
  event: NormalizedStripeEvent;
}

export type RecordStripeWebhookResult =
  | {
      inboxEventId: string;
      queueIntent: StripeWebhookQueueIntent;
      status: "already_recorded";
    }
  | {
      inboxEventId: string;
      queueIntent: StripeWebhookQueueIntent;
      status: "recorded";
    };

export interface RecordStripeWebhookDependencies {
  queuePublisher: QueuePublisher;
  webhookInboxRepository: WebhookInboxRepository;
}

export class RecordStripeWebhookUseCase {
  private readonly queuePublisher: QueuePublisher;

  private readonly webhookInboxRepository: WebhookInboxRepository;

  constructor(dependencies: RecordStripeWebhookDependencies) {
    this.queuePublisher = dependencies.queuePublisher;
    this.webhookInboxRepository = dependencies.webhookInboxRepository;
  }

  async execute(
    input: RecordStripeWebhookInput
  ): Promise<RecordStripeWebhookResult> {
    const existing = await this.webhookInboxRepository.findByStripeEventId(
      input.event.stripeEventId
    );

    if (existing) {
      return {
        inboxEventId: existing.id,
        queueIntent: {
          inboxEventId: existing.id,
          kind: "process-stripe-webhook",
          stripeEventId: existing.stripeEventId
        },
        status: "already_recorded"
      };
    }

    const recordedEvent = await this.webhookInboxRepository.record(input.event);
    const queueIntent: StripeWebhookQueueIntent = {
      inboxEventId: recordedEvent.id,
      kind: "process-stripe-webhook",
      stripeEventId: recordedEvent.stripeEventId
    };

    await this.queuePublisher.publishStripeWebhookProcessing(queueIntent);

    return {
      inboxEventId: recordedEvent.id,
      queueIntent,
      status: "recorded"
    };
  }
}
