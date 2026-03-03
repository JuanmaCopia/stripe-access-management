import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { createInfrastructureComposition } from "./create-infrastructure-composition.js";
import { PgBossQueueAdapter } from "../queue/index.js";
import {
  createIntegrationDatabaseClient,
  createTestCatalogPlanBindings,
  hasDatabaseUrl,
  resetInfrastructureTestDatabase,
  uniqueTestName
} from "../testing/test-helpers.js";

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
  "Infrastructure composition wires Phase 3 use cases to real adapters",
  { concurrency: false, skip: !databaseAvailable },
  async () => {
    assert.ok(database);

    const user = await database.user.create({
      data: {
        email: "composer@example.com",
        name: "Composer",
        stripeCustomerId: "cus_composer"
      }
    });

    await database.article.create({
      data: {
        bodyMarkdown: "# Composed article",
        excerpt: "Composed excerpt",
        published: true,
        publishedAt: new Date("2026-03-03T11:00:00.000Z"),
        requiredTier: "STARTER",
        slug: "composed-article",
        title: "Composed Article"
      }
    });

    const queueAdapter = new PgBossQueueAdapter({
      connectionString: process.env.DATABASE_URL,
      queueName: uniqueTestName("composition-webhook")
    });
    const composition = createInfrastructureComposition({
      catalogPlanBindings: createTestCatalogPlanBindings(),
      database,
      queueAdapter,
      stripeClient: {
        billingPortal: {
          sessions: {
            async create() {
              return {
                url: "https://billing.example.com/session"
              };
            }
          }
        },
        checkout: {
          sessions: {
            async create() {
              return {
                id: "cs_test_phase4",
                url: "https://checkout.example.com/session"
              };
            }
          }
        }
      }
    });

    try {
      const dashboard = await composition.useCases.listDashboardArticles.execute({
        viewerUserId: user.id
      });
      const checkout = await composition.useCases.startCheckout.execute({
        cancelUrl: "https://app.example.com/cancel",
        selectedPlan: {
          billingInterval: "MONTHLY",
          tier: "PRO"
        },
        successUrl: "https://app.example.com/success",
        userId: user.id
      });
      const portal = await composition.useCases.openBillingPortal.execute({
        returnUrl: "https://app.example.com/dashboard",
        userId: user.id
      });
      const recorded = await composition.useCases.recordStripeWebhook.execute({
        event: {
          occurredAt: new Date("2026-03-03T12:30:00.000Z"),
          payload: {
            object: "event"
          },
          receivedAt: new Date("2026-03-03T12:30:01.000Z"),
          stripeEventId: "evt_composed",
          subscription: null,
          type: "checkout.session.completed"
        }
      });
      const storedWebhook =
        await composition.repositories.webhookInboxRepository.findByStripeEventId(
          "evt_composed"
        );

      assert.equal(dashboard.items.length, 1);
      assert.equal(checkout.status, "ready");
      assert.equal(checkout.checkoutSessionId, "cs_test_phase4");
      assert.equal(portal.status, "ready");
      assert.equal(
        portal.billingPortalUrl,
        "https://billing.example.com/session"
      );
      assert.equal(recorded.status, "recorded");
      assert.equal(storedWebhook?.stripeEventId, "evt_composed");
    } finally {
      await queueAdapter.deleteAllJobs();
      await queueAdapter.stop();
    }
  }
);
