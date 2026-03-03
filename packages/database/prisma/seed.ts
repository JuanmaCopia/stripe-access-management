import { createDatabaseClient } from "../src/client";
import { seededArticleFixtures } from "./seed-fixtures";

const prisma = createDatabaseClient();

async function main() {
  for (const article of seededArticleFixtures) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        publishedAt: article.publishedAt,
        title: article.title,
        excerpt: article.excerpt,
        bodyMarkdown: article.bodyMarkdown,
        requiredTier: article.requiredTier,
        published: true
      },
      create: {
        ...article,
        published: true
      }
    });
  }

  console.info(
    `Seeded ${seededArticleFixtures.length} representative development articles.`
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
