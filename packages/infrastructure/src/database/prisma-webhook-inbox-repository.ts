import type {
  NormalizedStripeEvent,
  WebhookInboxRepository
} from "@stripe-access-management/core";
import type { DatabaseClient } from "@stripe-access-management/database";
import { mapWebhookInboxRecord } from "./mappers";

const webhookInboxSelect = {
  eventType: true,
  id: true,
  payload: true,
  receivedAt: true,
  stripeEventId: true
} as const;

export interface PrismaWebhookInboxRepositoryOptions {
  database: DatabaseClient;
}

export class PrismaWebhookInboxRepository implements WebhookInboxRepository {
  private readonly database: DatabaseClient;

  constructor(options: PrismaWebhookInboxRepositoryOptions) {
    this.database = options.database;
  }

  async findByStripeEventId(stripeEventId: string) {
    const event = await this.database.stripeWebhookInboxEvent.findUnique({
      select: webhookInboxSelect,
      where: {
        stripeEventId
      }
    });

    return event ? mapWebhookInboxRecord(event) : null;
  }

  async record(event: NormalizedStripeEvent) {
    const created = await this.database.stripeWebhookInboxEvent.create({
      data: {
        eventType: event.type,
        payload: event.payload,
        receivedAt: event.receivedAt,
        stripeEventId: event.stripeEventId
      },
      select: webhookInboxSelect
    });

    return mapWebhookInboxRecord(created);
  }
}
