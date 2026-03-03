import assert from "node:assert/strict";
import test from "node:test";

import { ListDashboardArticlesUseCase } from "./list-dashboard-articles.js";
import { ReadArticleUseCase } from "./read-article.js";
import type { ArticleRepository, ViewerSubscriptionRepository } from "./ports.js";
import type { Article } from "../domain/index.js";
import type { SubscriptionRecord } from "../../subscriptions/domain/index.js";
import type { Clock } from "../../../shared/kernel/index.js";

const now = new Date("2026-03-03T00:00:00.000Z");

const fixedClock: Clock = {
  now() {
    return now;
  }
};

const publishedArticles: Article[] = [
  {
    bodyMarkdown: "# Starter",
    excerpt: "Starter excerpt",
    id: "article_starter",
    published: true,
    publishedAt: now,
    requiredTier: "STARTER",
    slug: "starter-article",
    title: "Starter Article"
  },
  {
    bodyMarkdown: "# Ultra",
    excerpt: "Ultra excerpt",
    id: "article_ultra",
    published: true,
    publishedAt: now,
    requiredTier: "ULTRA",
    slug: "ultra-article",
    title: "Ultra Article"
  }
];

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

class InMemoryArticleRepository implements ArticleRepository {
  async findBySlug(slug: string): Promise<Article | null> {
    return publishedArticles.find((article) => article.slug === slug) ?? null;
  }

  async listPublishedArticles(): Promise<readonly Article[]> {
    return publishedArticles;
  }
}

class InMemoryViewerSubscriptionRepository
  implements ViewerSubscriptionRepository
{
  constructor(
    private readonly subscriptionByUserId: Map<string, SubscriptionRecord>
  ) {}

  async findByUserId(userId: string): Promise<SubscriptionRecord | null> {
    return this.subscriptionByUserId.get(userId) ?? null;
  }
}

test("ListDashboardArticlesUseCase marks accessible and locked articles from local access state", async () => {
  const useCase = new ListDashboardArticlesUseCase({
    articleRepository: new InMemoryArticleRepository(),
    clock: fixedClock,
    viewerSubscriptionRepository: new InMemoryViewerSubscriptionRepository(
      new Map([["user_123", createSubscription()]])
    )
  });

  const result = await useCase.execute({
    viewerUserId: "user_123"
  });

  assert.equal(result.items.length, 2);
  assert.equal(result.items[0]?.isLocked, false);
  assert.equal(result.items[1]?.isLocked, true);
});

test("ReadArticleUseCase returns a locked result without the body when access is missing", async () => {
  const useCase = new ReadArticleUseCase({
    articleRepository: new InMemoryArticleRepository(),
    clock: fixedClock,
    viewerSubscriptionRepository: new InMemoryViewerSubscriptionRepository(
      new Map([["user_123", createSubscription()]])
    )
  });

  const result = await useCase.execute({
    slug: "ultra-article",
    viewerUserId: "user_123"
  });

  assert.equal(result.status, "locked");

  if (result.status !== "locked") {
    throw new Error("Expected the article to be locked.");
  }

  assert.equal("bodyMarkdown" in result.article, false);
  assert.equal(result.article.access.reason, "insufficient_tier");
});
