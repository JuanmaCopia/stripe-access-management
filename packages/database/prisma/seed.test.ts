import assert from "node:assert/strict";
import test from "node:test";
import { seededArticleFixtures } from "./seed-fixtures";

test("seeded article fixtures cover every supported tier with stable metadata", () => {
  const tiers = new Set(
    seededArticleFixtures.map((article) => article.requiredTier)
  );
  const slugs = seededArticleFixtures.map((article) => article.slug);
  const publishedAtValues = seededArticleFixtures.map((article) =>
    article.publishedAt.toISOString()
  );

  assert.equal(seededArticleFixtures.length, 3);
  assert.deepEqual(Array.from(tiers).sort(), ["PRO", "STARTER", "ULTRA"]);
  assert.deepEqual(publishedAtValues, [
    "2026-03-01T09:00:00.000Z",
    "2026-03-02T09:00:00.000Z",
    "2026-03-03T09:00:00.000Z"
  ]);
  assert.equal(new Set(slugs).size, slugs.length);

  for (const article of seededArticleFixtures) {
    assert.equal(article.title.length > 0, true);
    assert.equal(article.excerpt.length > 0, true);
    assert.equal(article.bodyMarkdown.length > 0, true);
  }
});
