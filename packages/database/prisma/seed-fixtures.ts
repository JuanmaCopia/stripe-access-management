export const seededArticleFixtures = [
  {
    bodyMarkdown:
      "# Starter Blueprint\n\nBuild a reliable weekly publishing rhythm and use the dashboard as your member home base.",
    excerpt: "A starter-tier field guide for validating the first unlocked reading experience.",
    publishedAt: new Date("2026-03-01T09:00:00.000Z"),
    requiredTier: "STARTER",
    slug: "starter-blueprint",
    title: "Starter Blueprint"
  },
  {
    bodyMarkdown:
      "# Pro Growth System\n\nUse your Pro tier to connect editorial cadence, audience intent, and deeper member retention loops.",
    excerpt: "A Pro-tier article that proves inherited access from higher plans without live billing calls.",
    publishedAt: new Date("2026-03-02T09:00:00.000Z"),
    requiredTier: "PRO",
    slug: "pro-growth-system",
    title: "Pro Growth System"
  },
  {
    bodyMarkdown:
      "# Ultra Strategy Notes\n\nThis Ultra-only article models the highest-access reader state and the server-side locked fallback when access is missing.",
    excerpt: "An Ultra-tier article reserved for the highest subscription level and locked-state verification.",
    publishedAt: new Date("2026-03-03T09:00:00.000Z"),
    requiredTier: "ULTRA",
    slug: "ultra-strategy-notes",
    title: "Ultra Strategy Notes"
  }
] as const;
