import type { Clock } from "../../../shared/kernel/index";
import { systemClock } from "../../../shared/kernel/index";
import type {
  NormalizedStripeEvent,
  NormalizedSubscriptionSnapshot,
  StripeEventType
} from "./contracts";
import type { SubscriptionRepository } from "./ports";
import type {
  SubscriptionProjection,
  SubscriptionRecord
} from "../domain/index";

export type SyncStripeSubscriptionResult =
  | {
      reason: "missing_subscription_snapshot";
      status: "ignored";
    }
  | {
      accessChange: "extended" | "revoked" | "unchanged";
      status: "synced";
      subscription: SubscriptionRecord;
    };

export interface SyncStripeSubscriptionInput {
  event: NormalizedStripeEvent;
}

export interface SyncStripeSubscriptionDependencies {
  clock?: Clock;
  subscriptionRepository: SubscriptionRepository;
}

export class SyncStripeSubscriptionUseCase {
  private readonly clock: Clock;

  private readonly subscriptionRepository: SubscriptionRepository;

  constructor(dependencies: SyncStripeSubscriptionDependencies) {
    this.clock = dependencies.clock ?? systemClock;
    this.subscriptionRepository = dependencies.subscriptionRepository;
  }

  async execute(
    input: SyncStripeSubscriptionInput
  ): Promise<SyncStripeSubscriptionResult> {
    if (!input.event.subscription) {
      return {
        reason: "missing_subscription_snapshot",
        status: "ignored"
      };
    }

    const snapshot = input.event.subscription;
    const existingByStripeId =
      await this.subscriptionRepository.findByStripeSubscriptionId(
        snapshot.stripeSubscriptionId
      );
    const existing =
      existingByStripeId ??
      (await this.subscriptionRepository.findByUserId(snapshot.localUserId));
    const nextAccessExpiresAt = deriveAccessExpiresAt({
      eventType: input.event.type,
      existing,
      now: this.clock.now(),
      snapshot
    });
    const projection: SubscriptionProjection = {
      accessExpiresAt: nextAccessExpiresAt,
      billingInterval: snapshot.billingInterval,
      cancelAtPeriodEnd: snapshot.cancelAtPeriodEnd,
      lastSyncedAt: this.clock.now(),
      planTier: snapshot.planTier,
      stripeCustomerId: snapshot.stripeCustomerId,
      stripePriceId: snapshot.stripePriceId,
      stripeProductId: snapshot.stripeProductId,
      stripeStatus:
        input.event.type === "customer.subscription.deleted"
          ? "CANCELED"
          : snapshot.stripeStatus,
      stripeSubscriptionId: snapshot.stripeSubscriptionId,
      userId: snapshot.localUserId
    };
    const subscription =
      await this.subscriptionRepository.upsertProjection(projection);

    return {
      accessChange: determineAccessChange(
        existing?.accessExpiresAt ?? null,
        nextAccessExpiresAt
      ),
      status: "synced",
      subscription
    };
  }
}

function deriveAccessExpiresAt(input: {
  eventType: StripeEventType;
  existing: SubscriptionRecord | null;
  now: Date;
  snapshot: NormalizedSubscriptionSnapshot;
}): Date | null {
  const currentAccessExpiresAt = input.existing?.accessExpiresAt ?? null;

  switch (input.eventType) {
    case "invoice.paid":
      return getLaterDate(currentAccessExpiresAt, input.snapshot.accessPeriodEnd);
    case "customer.subscription.deleted":
      return input.now;
    case "checkout.session.completed":
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "invoice.payment_action_required":
    case "invoice.payment_failed":
      return currentAccessExpiresAt;
    default:
      return currentAccessExpiresAt;
  }
}

function determineAccessChange(
  previous: Date | null,
  next: Date | null
): "extended" | "revoked" | "unchanged" {
  const previousTime = previous?.getTime() ?? null;
  const nextTime = next?.getTime() ?? null;

  if (previousTime === nextTime) {
    return "unchanged";
  }

  if (nextTime === null) {
    return "revoked";
  }

  if (previousTime === null || nextTime > previousTime) {
    return "extended";
  }

  return "revoked";
}

function getLaterDate(left: Date | null, right: Date | null): Date | null {
  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return left > right ? left : right;
}
