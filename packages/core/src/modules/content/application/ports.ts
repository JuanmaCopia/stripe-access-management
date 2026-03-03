import type { SubscriptionRecord } from "../../subscriptions/domain/index.js";
import type { Article } from "../domain/index.js";

export interface ArticleRepository {
  findBySlug(slug: string): Promise<Article | null>;
  listPublishedArticles(): Promise<readonly Article[]>;
}

export interface ViewerSubscriptionRepository {
  findByUserId(userId: string): Promise<SubscriptionRecord | null>;
}
