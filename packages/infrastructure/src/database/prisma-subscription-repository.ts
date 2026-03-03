import type {
  SubscriptionProjection,
  SubscriptionRepository,
  ViewerSubscriptionRepository
} from "@stripe-access-management/core";
import type { DatabaseClient } from "@stripe-access-management/database";
import { mapSubscriptionRecord } from "./mappers";

const subscriptionSelect = {
  accessExpiresAt: true,
  billingInterval: true,
  cancelAtPeriodEnd: true,
  id: true,
  lastSyncedAt: true,
  planTier: true,
  stripePriceId: true,
  stripeProductId: true,
  stripeStatus: true,
  stripeSubscriptionId: true,
  user: {
    select: {
      stripeCustomerId: true
    }
  },
  userId: true
} as const;

const subscriptionIdentitySelect = {
  id: true,
  stripeSubscriptionId: true,
  userId: true
} as const;

export interface PrismaSubscriptionRepositoryOptions {
  database: DatabaseClient;
}

export class PrismaSubscriptionRepository
  implements SubscriptionRepository, ViewerSubscriptionRepository
{
  private readonly database: DatabaseClient;

  constructor(options: PrismaSubscriptionRepositoryOptions) {
    this.database = options.database;
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string) {
    const subscription = await this.database.subscription.findUnique({
      select: subscriptionSelect,
      where: {
        stripeSubscriptionId
      }
    });

    return subscription ? mapSubscriptionRecord(subscription) : null;
  }

  async findByUserId(userId: string) {
    const subscription = await this.database.subscription.findUnique({
      select: subscriptionSelect,
      where: {
        userId
      }
    });

    return subscription ? mapSubscriptionRecord(subscription) : null;
  }

  async upsertProjection(subscription: SubscriptionProjection) {
    return this.database.$transaction(async (transaction) => {
      const [existingByStripeId, existingByUserId] = await Promise.all([
        transaction.subscription.findUnique({
          select: subscriptionIdentitySelect,
          where: {
            stripeSubscriptionId: subscription.stripeSubscriptionId
          }
        }),
        transaction.subscription.findUnique({
          select: subscriptionIdentitySelect,
          where: {
            userId: subscription.userId
          }
        })
      ]);

      if (
        existingByStripeId &&
        existingByStripeId.userId !== subscription.userId
      ) {
        throw new Error(
          `Stripe subscription ${subscription.stripeSubscriptionId} is already linked to user ${existingByStripeId.userId}.`
        );
      }

      if (
        existingByStripeId &&
        existingByUserId &&
        existingByStripeId.id !== existingByUserId.id
      ) {
        throw new Error(
          `User ${subscription.userId} already has a different subscription row than Stripe subscription ${subscription.stripeSubscriptionId}.`
        );
      }

      await transaction.user.update({
        data: {
          stripeCustomerId: subscription.stripeCustomerId
        },
        where: {
          id: subscription.userId
        }
      });

      const current = existingByUserId ?? existingByStripeId;
      const persisted = current
        ? await transaction.subscription.update({
            data: {
              accessExpiresAt: subscription.accessExpiresAt,
              billingInterval: subscription.billingInterval,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              lastSyncedAt: subscription.lastSyncedAt,
              planTier: subscription.planTier,
              stripePriceId: subscription.stripePriceId,
              stripeProductId: subscription.stripeProductId,
              stripeStatus: subscription.stripeStatus,
              stripeSubscriptionId: subscription.stripeSubscriptionId,
              userId: subscription.userId
            },
            select: subscriptionSelect,
            where: {
              id: current.id
            }
          })
        : await transaction.subscription.create({
            data: {
              accessExpiresAt: subscription.accessExpiresAt,
              billingInterval: subscription.billingInterval,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
              lastSyncedAt: subscription.lastSyncedAt,
              planTier: subscription.planTier,
              stripePriceId: subscription.stripePriceId,
              stripeProductId: subscription.stripeProductId,
              stripeStatus: subscription.stripeStatus,
              stripeSubscriptionId: subscription.stripeSubscriptionId,
              userId: subscription.userId
            },
            select: subscriptionSelect
          });

      return mapSubscriptionRecord(persisted);
    });
  }
}
