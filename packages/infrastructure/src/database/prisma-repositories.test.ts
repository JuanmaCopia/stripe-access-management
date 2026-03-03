import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import {
  PrismaArticleRepository,
  PrismaSubscriptionRepository,
  PrismaUserIdentityRepository,
  PrismaWebhookInboxRepository
} from "./index";
import {
  createIntegrationDatabaseClient,
  hasDatabaseUrl,
  resetInfrastructureTestDatabase
} from "../testing/test-helpers";

const databaseAvailable = hasDatabaseUrl();
const database = databaseAvailable ? createIntegrationDatabaseClient() : null;

before(async () => {
  if (!database) {
    return;
  }

  await resetInfrastructureTestDatabase(database);
});

beforeEach(async () => {
  if (!database) {
    return;
  }

  await resetInfrastructureTestDatabase(database);
});

after(async () => {
  if (!database) {
    return;
  }

  await database.$disconnect();
});

test(
  "Prisma content and identity repositories map database records into core models",
  { concurrency: false, skip: !databaseAvailable },
  async () => {
    assert.ok(database);

    const user = await database.user.create({
      data: {
        email: "reader@example.com",
        name: "Reader",
        stripeCustomerId: "cus_reader"
      }
    });

    await database.article.createMany({
      data: [
        {
          bodyMarkdown: "# Starter body",
          excerpt: "Starter excerpt",
          published: true,
          publishedAt: new Date("2026-03-03T10:00:00.000Z"),
          requiredTier: "STARTER",
          slug: "starter-article",
          title: "Starter Article"
        },
        {
          bodyMarkdown: "# Draft body",
          excerpt: "Draft excerpt",
          published: false,
          requiredTier: "PRO",
          slug: "draft-article",
          title: "Draft Article"
        }
      ]
    });

    const articleRepository = new PrismaArticleRepository({
      database
    });
    const userIdentityRepository = new PrismaUserIdentityRepository({
      database
    });
    const publishedArticles = await articleRepository.listPublishedArticles();
    const draftArticle = await articleRepository.findBySlug("draft-article");
    const userIdentity = await userIdentityRepository.findById(user.id);

    assert.equal(publishedArticles.length, 1);
    assert.equal(publishedArticles[0]?.slug, "starter-article");
    assert.equal(publishedArticles[0]?.requiredTier, "STARTER");
    assert.equal(draftArticle?.published, false);
    assert.deepEqual(userIdentity, {
      email: "reader@example.com",
      id: user.id,
      name: "Reader",
      stripeCustomerId: "cus_reader"
    });
  }
);

test(
  "Prisma subscription repository upserts projections and synchronizes the local Stripe customer id",
  { concurrency: false, skip: !databaseAvailable },
  async () => {
    assert.ok(database);

    const user = await database.user.create({
      data: {
        email: "subscriber@example.com",
        name: "Subscriber"
      }
    });
    const repository = new PrismaSubscriptionRepository({
      database
    });
    const projection = {
      accessExpiresAt: new Date("2026-04-03T00:00:00.000Z"),
      billingInterval: "MONTHLY" as const,
      cancelAtPeriodEnd: false,
      lastSyncedAt: new Date("2026-03-03T12:00:00.000Z"),
      planTier: "PRO" as const,
      stripeCustomerId: "cus_subscriber",
      stripePriceId: "price_pro_monthly",
      stripeProductId: "prod_pro_monthly",
      stripeStatus: "ACTIVE" as const,
      stripeSubscriptionId: "sub_pro_monthly",
      userId: user.id
    };

    const stored = await repository.upsertProjection(projection);
    const byUser = await repository.findByUserId(user.id);
    const byStripeId = await repository.findByStripeSubscriptionId(
      "sub_pro_monthly"
    );
    const persistedUser = await database.user.findUnique({
      where: {
        id: user.id
      }
    });

    assert.equal(stored.userId, user.id);
    assert.equal(stored.stripeCustomerId, "cus_subscriber");
    assert.equal(stored.planTier, "PRO");
    assert.equal(byUser?.stripeSubscriptionId, "sub_pro_monthly");
    assert.equal(byStripeId?.stripePriceId, "price_pro_monthly");
    assert.equal(persistedUser?.stripeCustomerId, "cus_subscriber");
  }
);

test(
  "Prisma webhook inbox repository records and reloads normalized Stripe events",
  { concurrency: false, skip: !databaseAvailable },
  async () => {
    assert.ok(database);

    const repository = new PrismaWebhookInboxRepository({
      database
    });
    const event = await repository.record({
      occurredAt: new Date("2026-03-03T12:00:00.000Z"),
      payload: {
        object: "event",
        type: "invoice.paid"
      },
      receivedAt: new Date("2026-03-03T12:00:01.000Z"),
      stripeEventId: "evt_repository",
      subscription: null,
      type: "invoice.paid"
    });
    const reloaded = await repository.findByStripeEventId("evt_repository");

    assert.equal(event.type, "invoice.paid");
    assert.equal(reloaded?.stripeEventId, "evt_repository");
    assert.deepEqual(reloaded?.payload, {
      object: "event",
      type: "invoice.paid"
    });
  }
);
