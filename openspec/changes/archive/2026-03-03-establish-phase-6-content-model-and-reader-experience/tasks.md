## 1. Seed tiered article fixtures and compose content delivery

- [x] 1.1 Extend the database seed flow with deterministic published `STARTER`, `PRO`, and `ULTRA` article fixtures that expose stable titles, slugs, summaries, and required tiers
- [x] 1.2 Add web-side server composition helpers that resolve the authenticated local user and the existing content listing and article-read use cases through the Phase 4 infrastructure layer

## 2. Build the web content reader experience

- [x] 2.1 Refresh the public home page into a landing and pricing shell that introduces the tiered member reading experience and routes users into sign-in or the dashboard appropriately
- [x] 2.2 Replace the temporary member dashboard shell with a real article listing experience that renders locked or unlocked article summaries from the server-side dashboard listing result
- [x] 2.3 Add article detail routes that render full content for unlocked reads and a locked state for denied reads without exposing the protected body
- [x] 2.4 Ensure the member content routes continue to enforce authentication on the server before article data is returned

## 3. Verify seeded content and access-driven reader behavior

- [x] 3.1 Add focused tests for seeded article fixtures, dashboard access projection, and locked or unlocked article-route outcomes
- [x] 3.2 Verify the workspace lint, typecheck, test, and build flows pass with the new content reader surfaces in place
