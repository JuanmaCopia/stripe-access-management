import type { ArticleRepository } from "@stripe-access-management/core";
import type { DatabaseClient } from "@stripe-access-management/database";
import { mapArticleRecordToArticle } from "./mappers.js";

const articleSelect = {
  bodyMarkdown: true,
  excerpt: true,
  id: true,
  published: true,
  publishedAt: true,
  requiredTier: true,
  slug: true,
  title: true
} as const;

export interface PrismaArticleRepositoryOptions {
  database: DatabaseClient;
}

export class PrismaArticleRepository implements ArticleRepository {
  private readonly database: DatabaseClient;

  constructor(options: PrismaArticleRepositoryOptions) {
    this.database = options.database;
  }

  async findBySlug(slug: string) {
    const article = await this.database.article.findUnique({
      select: articleSelect,
      where: {
        slug
      }
    });

    return article ? mapArticleRecordToArticle(article) : null;
  }

  async listPublishedArticles() {
    const articles = await this.database.article.findMany({
      orderBy: [
        {
          publishedAt: "desc"
        },
        {
          createdAt: "desc"
        }
      ],
      select: articleSelect,
      where: {
        published: true
      }
    });

    return articles.map(mapArticleRecordToArticle);
  }
}
