import assert from "node:assert/strict";
import test from "node:test";

import type { CatalogPlanResolver } from "../../catalog/application/index";
import type { CatalogPlan, PlanSelection } from "../../catalog/domain/index";
import type { UserIdentityRepository } from "../../identity/application/index";
import type { UserIdentity } from "../../identity/domain/index";
import type { Clock, JsonObject } from "../../../shared/kernel/index";
import { OpenBillingPortalUseCase } from "./open-billing-portal";
import { RecordStripeWebhookUseCase } from "./record-stripe-webhook";
import { StartCheckoutUseCase } from "./start-checkout";
import { SyncStripeSubscriptionUseCase } from "./sync-stripe-subscription";
import type {
  NormalizedStripeEvent,
  RecordedStripeWebhookEvent,
  StripeWebhookQueueIntent
} from "./contracts";
import type {
  BillingGateway,
  QueuePublisher,
  SubscriptionRepository,
  WebhookInboxRepository
} from "./ports";
import type { SubscriptionProjection, SubscriptionRecord } from "../domain/index";

const now = new Date("2026-03-03T00:00:00.000Z");

const fixedClock: Clock = {
  now() {
    return now;
  }
};

function createUser(overrides: Partial<UserIdentity> = {}): UserIdentity {
  return {
    email: "user@example.com",
    id: "user_123",
    name: "Phase Three User",
    stripeCustomerId: "cus_123",
    ...overrides
  };
}

function createSubscription(
  overrides: Partial<SubscriptionRecord> = {}
): SubscriptionRecord {
  return {
    accessExpiresAt: new Date("2026-04-01T00:00:00.000Z"),
    billingInterval: "MONTHLY",
    cancelAtPeriodEnd: false,
    id: "sub_123",
    lastSyncedAt: now,
    planTier: "PRO",
    stripeCustomerId: "cus_123",
    stripePriceId: "price_123",
    stripeProductId: "prod_123",
    stripeStatus: "ACTIVE",
    stripeSubscriptionId: "stripe_sub_123",
    userId: "user_123",
    ...overrides
  };
}

class InMemoryUserIdentityRepository implements UserIdentityRepository {
  constructor(private readonly users: Map<string, UserIdentity>) {}

  async findById(userId: string): Promise<UserIdentity | null> {
    return this.users.get(userId) ?? null;
  }
}

class InMemoryCatalogPlanResolver implements CatalogPlanResolver {
  constructor(private readonly plans: Map<string, CatalogPlan>) {}

  async resolvePlanSelection(selection: PlanSelection): Promise<CatalogPlan | null> {
    return this.plans.get(`${selection.tier}:${selection.billingInterval}`) ?? null;
  }
}

class InMemorySubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly subscriptions: Map<string, SubscriptionRecord>) {}

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string
  ): Promise<SubscriptionRecord | null> {
    return (
      Array.from(this.subscriptions.values()).find(
        (subscription) =>
          subscription.stripeSubscriptionId === stripeSubscriptionId
      ) ?? null
    );
  }

  async findByUserId(userId: string): Promise<SubscriptionRecord | null> {
    return this.subscriptions.get(userId) ?? null;
  }

  async upsertProjection(
    subscription: SubscriptionProjection
  ): Promise<SubscriptionRecord> {
    const existing = this.subscriptions.get(subscription.userId);
    const record: SubscriptionRecord = {
      ...subscription,
      id: existing?.id ?? `sub_${subscription.userId}`
    };

    this.subscriptions.set(subscription.userId, record);

    return record;
  }
}

class InMemoryBillingGateway implements BillingGateway {
  public lastCheckoutRequest:
    | {
        cancelUrl: string;
        existingSubscription: SubscriptionRecord | null;
        plan: CatalogPlan;
        successUrl: string;
        user: UserIdentity;
      }
    | null = null;

  async createBillingPortalSession(): Promise<{ billingPortalUrl: string }> {
    return {
      billingPortalUrl: "https://billing.example.test/portal"
    };
  }

  async createCheckoutSession(input: {
    cancelUrl: string;
    existingSubscription: SubscriptionRecord | null;
    plan: CatalogPlan;
    successUrl: string;
    user: UserIdentity;
  }): Promise<{ checkoutSessionId: string; checkoutSessionUrl: string }> {
    this.lastCheckoutRequest = input;

    return {
      checkoutSessionId: "cs_123",
      checkoutSessionUrl: "https://checkout.example.test/session"
    };
  }
}

class InMemoryWebhookInboxRepository implements WebhookInboxRepository {
  constructor(
    private readonly eventsByStripeId: Map<string, RecordedStripeWebhookEvent>
  ) {}

  async findByStripeEventId(
    stripeEventId: string
  ): Promise<RecordedStripeWebhookEvent | null> {
    return this.eventsByStripeId.get(stripeEventId) ?? null;
  }

  async record(event: NormalizedStripeEvent): Promise<RecordedStripeWebhookEvent> {
    const recorded: RecordedStripeWebhookEvent = {
      id: `inbox_${event.stripeEventId}`,
      payload: event.payload,
      receivedAt: event.receivedAt,
      stripeEventId: event.stripeEventId,
      type: event.type
    };

    this.eventsByStripeId.set(event.stripeEventId, recorded);

    return recorded;
  }
}

class InMemoryQueuePublisher implements QueuePublisher {
  public publishedIntents: StripeWebhookQueueIntent[] = [];

  async publishStripeWebhookProcessing(
    intent: StripeWebhookQueueIntent
  ): Promise<void> {
    this.publishedIntents.push(intent);
  }
}

function createCatalogPlan(): CatalogPlan {
  return {
    billingInterval: "MONTHLY",
    displayName: "Pro Monthly",
    lookupKey: "pro-monthly",
    tier: "PRO"
  };
}

function createEventPayload(): JsonObject {
  return {
    object: "event"
  };
}

function createNormalizedInvoicePaidEvent(
  overrides: Partial<NormalizedStripeEvent> = {}
): NormalizedStripeEvent {
  return {
    occurredAt: now,
    payload: createEventPayload(),
    receivedAt: now,
    stripeEventId: "evt_paid_123",
    subscription: {
      accessPeriodEnd: new Date("2026-05-01T00:00:00.000Z"),
      billingInterval: "MONTHLY",
      cancelAtPeriodEnd: false,
      localUserId: "user_123",
      planTier: "PRO",
      stripeCustomerId: "cus_123",
      stripePriceId: "price_123",
      stripeProductId: "prod_123",
      stripeStatus: "ACTIVE",
      stripeSubscriptionId: "stripe_sub_123"
    },
    type: "invoice.paid",
    ...overrides
  };
}

test("StartCheckoutUseCase blocks duplicate checkout for an already active plan", async () => {
  const useCase = new StartCheckoutUseCase({
    billingGateway: new InMemoryBillingGateway(),
    catalogPlanResolver: new InMemoryCatalogPlanResolver(
      new Map([["PRO:MONTHLY", createCatalogPlan()]])
    ),
    clock: fixedClock,
    subscriptionRepository: new InMemorySubscriptionRepository(
      new Map([["user_123", createSubscription()]])
    ),
    userIdentityRepository: new InMemoryUserIdentityRepository(
      new Map([["user_123", createUser()]])
    )
  });

  const result = await useCase.execute({
    cancelUrl: "https://app.test/cancel",
    selectedPlan: {
      billingInterval: "MONTHLY",
      tier: "PRO"
    },
    successUrl: "https://app.test/success",
    userId: "user_123"
  });

  assert.equal(result.status, "duplicate_subscription");
});

test("OpenBillingPortalUseCase requires a local Stripe customer id", async () => {
  const useCase = new OpenBillingPortalUseCase({
    billingGateway: new InMemoryBillingGateway(),
    userIdentityRepository: new InMemoryUserIdentityRepository(
      new Map([["user_123", createUser({ stripeCustomerId: null })]])
    )
  });

  const result = await useCase.execute({
    returnUrl: "https://app.test/account",
    userId: "user_123"
  });

  assert.equal(result.status, "billing_portal_unavailable");
});

test("RecordStripeWebhookUseCase stores new events and enqueues async processing", async () => {
  const queuePublisher = new InMemoryQueuePublisher();
  const useCase = new RecordStripeWebhookUseCase({
    queuePublisher,
    webhookInboxRepository: new InMemoryWebhookInboxRepository(new Map())
  });

  const result = await useCase.execute({
    event: createNormalizedInvoicePaidEvent({
      stripeEventId: "evt_record_123",
      type: "customer.subscription.updated"
    })
  });

  assert.equal(result.status, "recorded");
  assert.equal(queuePublisher.publishedIntents.length, 1);
  assert.deepEqual(queuePublisher.publishedIntents[0], {
    inboxEventId: "inbox_evt_record_123",
    kind: "process-stripe-webhook",
    stripeEventId: "evt_record_123"
  });
});

test("SyncStripeSubscriptionUseCase extends access on invoice.paid", async () => {
  const subscriptionRepository = new InMemorySubscriptionRepository(
    new Map([["user_123", createSubscription()]])
  );
  const useCase = new SyncStripeSubscriptionUseCase({
    clock: fixedClock,
    subscriptionRepository
  });

  const result = await useCase.execute({
    event: createNormalizedInvoicePaidEvent()
  });

  assert.equal(result.status, "synced");

  if (result.status !== "synced") {
    throw new Error("Expected the subscription sync to succeed.");
  }

  assert.equal(result.accessChange, "extended");
  assert.equal(
    result.subscription.accessExpiresAt?.toISOString(),
    "2026-05-01T00:00:00.000Z"
  );
});
