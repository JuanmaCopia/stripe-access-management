import {
  type ArticleAccessDecision,
  evaluateArticleAccess
} from "../../access/domain/index";
import type { Clock } from "../../../shared/kernel/index";
import { systemClock } from "../../../shared/kernel/index";
import { isArticlePublished } from "../domain/index";
import type { ArticleRepository, ViewerSubscriptionRepository } from "./ports";

export interface DashboardArticleSummary {
  access: ArticleAccessDecision;
  excerpt: string;
  id: string;
  isLocked: boolean;
  requiredTier: string;
  slug: string;
  title: string;
}

export interface ListDashboardArticlesInput {
  viewerUserId?: string | null;
}

export interface ListDashboardArticlesResult {
  items: DashboardArticleSummary[];
}

export interface ListDashboardArticlesDependencies {
  articleRepository: ArticleRepository;
  clock?: Clock;
  viewerSubscriptionRepository: ViewerSubscriptionRepository;
}

export class ListDashboardArticlesUseCase {
  private readonly articleRepository: ArticleRepository;

  private readonly clock: Clock;

  private readonly viewerSubscriptionRepository: ViewerSubscriptionRepository;

  constructor(dependencies: ListDashboardArticlesDependencies) {
    this.articleRepository = dependencies.articleRepository;
    this.clock = dependencies.clock ?? systemClock;
    this.viewerSubscriptionRepository = dependencies.viewerSubscriptionRepository;
  }

  async execute(
    input: ListDashboardArticlesInput
  ): Promise<ListDashboardArticlesResult> {
    const articles = await this.articleRepository.listPublishedArticles();
    const subscription = input.viewerUserId
      ? await this.viewerSubscriptionRepository.findByUserId(input.viewerUserId)
      : null;

    return {
      items: articles.filter(isArticlePublished).map((article) => {
        const access = evaluateArticleAccess({
          isAuthenticated: Boolean(input.viewerUserId),
          now: this.clock.now(),
          requiredTier: article.requiredTier,
          subscription
        });

        return {
          access,
          excerpt: article.excerpt,
          id: article.id,
          isLocked: !access.allowed,
          requiredTier: article.requiredTier,
          slug: article.slug,
          title: article.title
        };
      })
    };
  }
}
