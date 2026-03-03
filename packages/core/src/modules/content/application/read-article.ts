import {
  type ArticleAccessDecision,
  evaluateArticleAccess
} from "../../access/domain/index.js";
import type { Clock } from "../../../shared/kernel/index.js";
import { systemClock } from "../../../shared/kernel/index.js";
import { isArticlePublished, type Article } from "../domain/index.js";
import type { ArticleRepository, ViewerSubscriptionRepository } from "./ports.js";

export interface ReadArticleInput {
  slug: string;
  viewerUserId?: string | null;
}

export interface ReadArticleLockedArticle {
  access: ArticleAccessDecision;
  excerpt: string;
  id: string;
  requiredTier: string;
  slug: string;
  title: string;
}

export type ReadArticleResult =
  | {
      article: Article;
      status: "available";
    }
  | {
      article: ReadArticleLockedArticle;
      status: "locked";
    }
  | {
      status: "not_found";
    };

export interface ReadArticleDependencies {
  articleRepository: ArticleRepository;
  clock?: Clock;
  viewerSubscriptionRepository: ViewerSubscriptionRepository;
}

export class ReadArticleUseCase {
  private readonly articleRepository: ArticleRepository;

  private readonly clock: Clock;

  private readonly viewerSubscriptionRepository: ViewerSubscriptionRepository;

  constructor(dependencies: ReadArticleDependencies) {
    this.articleRepository = dependencies.articleRepository;
    this.clock = dependencies.clock ?? systemClock;
    this.viewerSubscriptionRepository = dependencies.viewerSubscriptionRepository;
  }

  async execute(input: ReadArticleInput): Promise<ReadArticleResult> {
    const article = await this.articleRepository.findBySlug(input.slug);

    if (!article || !isArticlePublished(article)) {
      return {
        status: "not_found"
      };
    }

    const subscription = input.viewerUserId
      ? await this.viewerSubscriptionRepository.findByUserId(input.viewerUserId)
      : null;
    const access = evaluateArticleAccess({
      isAuthenticated: Boolean(input.viewerUserId),
      now: this.clock.now(),
      requiredTier: article.requiredTier,
      subscription
    });

    if (!access.allowed) {
      return {
        article: {
          access,
          excerpt: article.excerpt,
          id: article.id,
          requiredTier: article.requiredTier,
          slug: article.slug,
          title: article.title
        },
        status: "locked"
      };
    }

    return {
      article,
      status: "available"
    };
  }
}
