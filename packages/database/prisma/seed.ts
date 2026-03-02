import { PlanTier } from "@prisma/client";

import { createDatabaseClient } from "../src/client.js";

const prisma = createDatabaseClient();

const articles = [
  {
    slug: "starter-blueprint",
    title: "Starter Blueprint",
    excerpt: "A practical starter-tier article used to validate seeded access.",
    bodyMarkdown:
      "# Starter Blueprint\n\nThis seeded article is available to Starter subscribers and above.",
    requiredTier: PlanTier.STARTER
  },
  {
    slug: "pro-growth-system",
    title: "Pro Growth System",
    excerpt: "A Pro-tier article for validating inherited access from higher plans.",
    bodyMarkdown:
      "# Pro Growth System\n\nThis seeded article is available to Pro subscribers and above.",
    requiredTier: PlanTier.PRO
  },
  {
    slug: "ultra-strategy-notes",
    title: "Ultra Strategy Notes",
    excerpt: "An Ultra-tier article reserved for the highest subscription level.",
    bodyMarkdown:
      "# Ultra Strategy Notes\n\nThis seeded article is available only to Ultra subscribers.",
    requiredTier: PlanTier.ULTRA
  }
];

async function main() {
  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        title: article.title,
        excerpt: article.excerpt,
        bodyMarkdown: article.bodyMarkdown,
        requiredTier: article.requiredTier,
        published: true,
        publishedAt: new Date()
      },
      create: {
        ...article,
        published: true,
        publishedAt: new Date()
      }
    });
  }

  console.info(`Seeded ${articles.length} representative development articles.`);
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
