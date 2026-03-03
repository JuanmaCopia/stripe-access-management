import type { PlanTier } from "../../catalog/domain/index";

export interface Article {
  bodyMarkdown: string;
  excerpt: string;
  id: string;
  published: boolean;
  publishedAt: Date | null;
  requiredTier: PlanTier;
  slug: string;
  title: string;
}

export function isArticlePublished(article: Article): boolean {
  return article.published;
}
