import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import {
  createIntegrationDatabaseClient,
  hasDatabaseUrl,
  resetWebAppTestDatabase
} from "../../test/database-test-helpers";
import {
  createWebContentReaderServices,
  loadMemberArticle,
  loadMemberDashboardArticles
} from "./content-reader";

const databaseAvailable = hasDatabaseUrl();
const database = databaseAvailable ? createIntegrationDatabaseClient() : null;

before(async () => {
  if (!database) {
    return;
  }

  await resetWebAppTestDatabase(database);
});

beforeEach(async () => {
  if (!database) {
    return;
  }

  await resetWebAppTestDatabase(database);
});

after(async () => {
  if (!database) {
    return;
  }

  await database.$disconnect();
});

test(
  "member dashboard projects locked and unlocked articles from local access",
  { concurrency: false, skip: !databaseAvailable },
  async () => {
    assert.ok(database);

    const services = createWebContentReaderServices({
      database
    });
    const user = await database.user.create({
      data: {
        email: "reader@example.com",
        name: "Reader",
        stripeCustomerId: "cus_reader"
      }
    });

    await database.subscription.create({
      data: {
        accessExpiresAt: new Date("2026-04-01T00:00:00.000Z"),
        billingInterval: "MONTHLY",
        lastSyncedAt: new Date("2026-03-03T00:00:00.000Z"),
        planTier: "STARTER",
        stripePriceId: "price_starter",
        stripeProductId: "prod_starter",
        stripeStatus: "ACTIVE",
        stripeSubscriptionId: "sub_reader",
        userId: user.id
      }
    });

    await database.article.createMany({
      data: [
        {
          bodyMarkdown: "# Starter",
          excerpt: "Starter excerpt",
          published: true,
          publishedAt: new Date("2026-03-03T00:00:00.000Z"),
          requiredTier: "STARTER",
          slug: "starter-story",
          title: "Starter Story"
        },
        {
          bodyMarkdown: "# Ultra",
          excerpt: "Ultra excerpt",
          published: true,
          publishedAt: new Date("2026-03-02T00:00:00.000Z"),
          requiredTier: "ULTRA",
          slug: "ultra-story",
          title: "Ultra Story"
        }
      ]
    });

    const result = await loadMemberDashboardArticles({
      services,
      viewerUserId: user.id
    });
    const itemsBySlug = new Map(
      result.items.map((item) => [item.slug, item])
    );

    assert.equal(itemsBySlug.get("starter-story")?.isLocked, false);
    assert.equal(itemsBySlug.get("ultra-story")?.isLocked, true);
  }
);

test(
  "member article reads stay locked without exposing the protected body when access is insufficient",
  { concurrency: false, skip: !databaseAvailable },
  async () => {
    assert.ok(database);

    const services = createWebContentReaderServices({
      database
    });
    const user = await database.user.create({
      data: {
        email: "locked@example.com",
        name: "Locked Reader",
        stripeCustomerId: "cus_locked"
      }
    });

    await database.subscription.create({
      data: {
        accessExpiresAt: new Date("2026-04-01T00:00:00.000Z"),
        billingInterval: "MONTHLY",
        lastSyncedAt: new Date("2026-03-03T00:00:00.000Z"),
        planTier: "PRO",
        stripePriceId: "price_pro",
        stripeProductId: "prod_pro",
        stripeStatus: "ACTIVE",
        stripeSubscriptionId: "sub_locked",
        userId: user.id
      }
    });

    await database.article.create({
      data: {
        bodyMarkdown: "# Ultra",
        excerpt: "Ultra excerpt",
        published: true,
        publishedAt: new Date("2026-03-03T00:00:00.000Z"),
        requiredTier: "ULTRA",
        slug: "ultra-membership-briefing",
        title: "Ultra Membership Briefing"
      }
    });

    const result = await loadMemberArticle({
      services,
      slug: "ultra-membership-briefing",
      viewerUserId: user.id
    });

    assert.equal(result.status, "locked");

    if (result.status !== "locked") {
      throw new Error("Expected the article to remain locked.");
    }

    assert.equal("bodyMarkdown" in result.article, false);
    assert.equal(result.article.access.reason, "insufficient_tier");
  }
);

test(
  "member article reads return the protected body when local access allows it",
  { concurrency: false, skip: !databaseAvailable },
  async () => {
    assert.ok(database);

    const services = createWebContentReaderServices({
      database
    });
    const user = await database.user.create({
      data: {
        email: "available@example.com",
        name: "Available Reader",
        stripeCustomerId: "cus_available"
      }
    });

    await database.subscription.create({
      data: {
        accessExpiresAt: new Date("2026-04-01T00:00:00.000Z"),
        billingInterval: "MONTHLY",
        lastSyncedAt: new Date("2026-03-03T00:00:00.000Z"),
        planTier: "ULTRA",
        stripePriceId: "price_ultra",
        stripeProductId: "prod_ultra",
        stripeStatus: "ACTIVE",
        stripeSubscriptionId: "sub_available",
        userId: user.id
      }
    });

    await database.article.create({
      data: {
        bodyMarkdown: "# Ultra access granted",
        excerpt: "Ultra excerpt",
        published: true,
        publishedAt: new Date("2026-03-03T00:00:00.000Z"),
        requiredTier: "ULTRA",
        slug: "ultra-access-granted",
        title: "Ultra Access Granted"
      }
    });

    const result = await loadMemberArticle({
      services,
      slug: "ultra-access-granted",
      viewerUserId: user.id
    });

    assert.equal(result.status, "available");

    if (result.status !== "available") {
      throw new Error("Expected the article to be available.");
    }

    assert.equal(result.article.bodyMarkdown, "# Ultra access granted");
  }
);
