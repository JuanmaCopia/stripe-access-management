## Context

Phase 3 already introduced content listing and article-read use cases with server-safe locked or unlocked outcomes, and Phase 4 made those use cases composable with real Prisma-backed repositories. Phase 5 then established the authenticated session boundary in `apps/web`, which means the missing piece is now delivery: members still cannot browse tiered content through the web app, and local development still lacks realistic seeded articles across all three plans.

Phase 6 crosses `apps/web`, the Prisma seed flow, and the existing infrastructure composition, but it should not reopen billing, webhook, or catalog work. The goal is to validate the reader experience and access behavior with the current local subscription projection, not to design the final subscription purchase journey early.

## Goals / Non-Goals

**Goals:**
- Add the first real member content experience in `apps/web`
- Seed representative `STARTER`, `PRO`, and `ULTRA` articles for local development and verification
- Reuse the existing content use cases and access policy instead of re-implementing article access logic in pages
- Render locked and unlocked article states on the server without exposing protected bodies when access is denied
- Add enough public landing and pricing shell UI to support the locked-content narrative before checkout exists

**Non-Goals:**
- Build Checkout, billing portal, or upgrade purchase flows
- Introduce article authoring tools, admin workflows, or CMS integration
- Change Phase 3 access rules or add Stripe-dependent article reads
- Add client-heavy content fetching that bypasses server access enforcement

## Decisions

### Decision: Use the infrastructure composition to power web content routes

`apps/web` will resolve dashboard listings and article reads by composing the existing Phase 3 use cases with the Phase 4 Prisma-backed adapters instead of querying Prisma directly in pages.

Why this decision:
- It preserves the clean architecture boundary already established in `core` and `infrastructure`.
- It keeps the dashboard and article pages aligned with the same access policy that later billing and webhook phases will update.

Alternatives considered:
- Query Prisma directly in `apps/web`.
  - Faster for a single phase, but it would duplicate mapping and access logic in the delivery layer.
- Add a second content-specific composition path just for web.
  - Slightly more isolated, but unnecessary while the existing composition can already provide the required use cases.

### Decision: Keep article pages behind authenticated member routes, but distinguish locked versus unlocked for signed-in users

Unauthenticated users will stay on the public landing and pricing shell and will be redirected to sign in before entering member content routes. Signed-in users can browse the dashboard and article detail pages, where article reads render either the full body or a locked state depending on the current local access projection.

Why this decision:
- It matches the authenticated boundary introduced in Phase 5 without creating half-public, half-private article behavior before billing exists.
- It lets the product validate the most important reader state split now: authenticated with access versus authenticated without access.

Alternatives considered:
- Make article detail pages fully public and only hide the body for unpaid users.
  - Better for SEO eventually, but it complicates the MVP flow before pricing and upsell behavior are settled.
- Redirect locked users away from article routes instead of rendering a locked state.
  - Simpler routing, but weaker product feedback because users lose the contextual explanation of what is locked.

### Decision: Extend the Prisma seed flow with deterministic tiered article fixtures

The existing seed path will be expanded to create stable, published sample articles for each plan tier so dashboard and article routes can be exercised immediately in local environments and tests.

Why this decision:
- It gives the team a reliable baseline to verify access behavior without manual database setup.
- It keeps the MVP aligned with the roadmap assumption that content authoring remains manual and seeded for now.

Alternatives considered:
- Depend on manual SQL inserts or ad hoc local content entry.
  - Lower implementation effort at first, but inconsistent across contributors and harder to test.
- Introduce a fixture loader separate from the seed command.
  - More flexible later, but unnecessary before the MVP needs multiple environments or richer content tooling.

### Decision: Render article access on the server and avoid shipping protected bodies into locked states

The article detail route will call the existing read-article use case on the server and will branch its UI from the locked or unlocked result. The locked branch can show title, summary, required tier, and upgrade messaging, but it must not receive the full article body.

Why this decision:
- It honors the Phase 3 and Phase 5 contract that access enforcement is server-side and safe against UI-only bypasses.
- It keeps future billing upgrades straightforward because the route contract is already shaped around a protected read result.

Alternatives considered:
- Fetch article content in a client component after rendering.
  - Faster to iterate on UI, but weaker from an enforcement and architecture standpoint.
- Preload the full body and hide it in the client for locked users.
  - Simpler branching, but directly violates the protected-content requirement.

## Risks / Trade-offs

- [Content UX starts looking too much like the final product shell] -> Keep Phase 6 intentionally scoped to landing, pricing shell, dashboard, and article detail routes without expanding into full account or billing journeys.
- [Web pages drift from the core access contract] -> Route all article listing and reading through the existing composed use cases.
- [Seed data becomes brittle or unrealistic] -> Use stable slugs, titles, and tiers that are intentionally small but representative across all plans.
- [Locked content messaging becomes tightly coupled to future checkout details] -> Keep the locked state focused on required tier messaging and defer purchase wiring to later phases.
- [Dynamic member routes increase rendering complexity] -> Accept server-rendered member content now because authentication and access are request-scoped concerns already established in Phase 5.

## Migration Plan

1. Extend the database seed flow with deterministic published articles for each subscription tier.
2. Add a small web-side content composition helper that resolves the current local user and the content use cases needed by dashboard and article routes.
3. Replace the temporary member dashboard shell with a real article listing experience.
4. Add article detail routes that render locked or unlocked states from the core read result.
5. Refresh the public home page into a landing and pricing shell that connects naturally to the new member content surface.
6. Add focused tests for seeded content expectations and locked or unlocked route behavior, then verify the workspace lint, typecheck, test, and build flows.

Rollback is straightforward because Phase 6 primarily adds delivery code and seed fixtures on top of existing contracts. The safest rollback path is to remove the new routes and seed entries while keeping the Phase 3 to Phase 5 core, infrastructure, and auth boundaries intact.

## Open Questions

- None for proposal readiness. The exact route names and page layout choices can be finalized during implementation as long as the member content routes stay server-enforced and the seed data covers all three tiers.
