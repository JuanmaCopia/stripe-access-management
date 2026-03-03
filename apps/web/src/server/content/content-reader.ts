import {
  ListDashboardArticlesUseCase,
  ReadArticleUseCase,
  type Clock
} from "@stripe-access-management/core";
import {
  getDatabaseClient,
  type DatabaseClient
} from "@stripe-access-management/database";
import {
  PrismaArticleRepository,
  PrismaSubscriptionRepository
} from "@stripe-access-management/infrastructure";

export interface WebContentReaderServices {
  listDashboardArticles: ListDashboardArticlesUseCase;
  readArticle: ReadArticleUseCase;
}

export interface CreateWebContentReaderServicesOptions {
  clock?: Clock;
  database?: DatabaseClient;
}

export function createWebContentReaderServices(
  options: CreateWebContentReaderServicesOptions = {}
): WebContentReaderServices {
  const database = options.database ?? getDatabaseClient();
  const articleRepository = new PrismaArticleRepository({
    database
  });
  const subscriptionRepository = new PrismaSubscriptionRepository({
    database
  });

  return {
    listDashboardArticles: new ListDashboardArticlesUseCase({
      articleRepository,
      clock: options.clock,
      viewerSubscriptionRepository: subscriptionRepository
    }),
    readArticle: new ReadArticleUseCase({
      articleRepository,
      clock: options.clock,
      viewerSubscriptionRepository: subscriptionRepository
    })
  };
}

export async function loadMemberDashboardArticles(input: {
  services?: WebContentReaderServices;
  viewerUserId: string;
}) {
  const services = input.services ?? createWebContentReaderServices();

  return services.listDashboardArticles.execute({
    viewerUserId: input.viewerUserId
  });
}

export async function loadMemberArticle(input: {
  services?: WebContentReaderServices;
  slug: string;
  viewerUserId: string;
}) {
  const services = input.services ?? createWebContentReaderServices();

  return services.readArticle.execute({
    slug: input.slug,
    viewerUserId: input.viewerUserId
  });
}

export function formatPlanTierLabel(requiredTier: string): string {
  switch (requiredTier) {
    case "STARTER":
      return "Starter";
    case "PRO":
      return "Pro";
    case "ULTRA":
      return "Ultra";
    default:
      return requiredTier;
  }
}

export function describeLockedArticleReason(reason: string): string {
  switch (reason) {
    case "access_expired":
      return "Your last paid access window has expired. A later billing sync can reopen this article.";
    case "insufficient_tier":
      return "This article is reserved for a higher tier than your current local access allows.";
    case "missing_subscription":
      return "You are signed in, but no local subscription access has been recorded for this account yet.";
    case "subscription_inactive":
      return "Your subscription is no longer in an access-eligible state for protected articles.";
    default:
      return "This article is still locked for your account.";
  }
}
