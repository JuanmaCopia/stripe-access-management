## Context

The repository already contains strong planning inputs for the MVP:
- roadmap and delivery sequencing
- architecture and package boundaries
- MVP product scope and non-goals
- Stripe webhook and access rules

Phase 0 is still incomplete because the implementation tracker referenced by the roadmap has not been created and one final content-management assumption needed to be frozen: articles will be manually seeded for the MVP rather than managed through an admin UI.

This change is cross-cutting even though it does not add runtime code. It defines the implementation contract that later scaffolding and feature work must follow across `apps/web`, `apps/worker`, `packages/core`, `packages/infrastructure`, and `packages/database`.

## Goals / Non-Goals

**Goals:**
- Complete the missing Phase 0 deliverables before coding starts
- Freeze the MVP assumptions that Phase 1 depends on
- Establish a tracker that makes phase status, blockers, and exit criteria visible
- Encode the architectural guardrails that keep business logic out of delivery and infrastructure layers

**Non-Goals:**
- Scaffolding the monorepo or generating application code
- Designing or implementing an admin content management interface
- Changing the chosen billing model, auth strategy, or queue strategy
- Expanding the MVP beyond manual article seeding, Stripe-hosted billing, and local access checks

## Decisions

### Decision: Close Phase 0 as a documentation and governance change

Phase 0 will end only when the required planning artifacts are present and internally consistent, not when scaffolding has started.

Why this decision:
- It preserves the roadmap sequence of planning first, tooling second.
- It reduces the chance that Phase 1 introduces accidental boundary violations while the architecture is still implicit.

Alternatives considered:
- Start Phase 1 immediately and finish the missing tracker later.
  - Faster in the short term, but it weakens the delivery contract and makes progress harder to measure.
- Merge Phase 0 and Phase 1 into a single bootstrap change.
  - Simpler administratively, but it hides unresolved planning work inside implementation.

### Decision: Treat manual article seeding as the only MVP content authoring path

The MVP will use seeded or manually inserted articles instead of an admin editor or CMS.

Why this decision:
- It keeps scope aligned with the documented MVP goal: paid access to text content, not content operations tooling.
- It keeps Phase 2 and Phase 6 focused on access-controlled reading flows rather than authoring workflows.

Alternatives considered:
- Build an internal admin UI now.
  - More flexible for content operations, but it expands surface area, data validation, and authorization needs before core billing flows exist.
- Integrate an external CMS.
  - Better authoring ergonomics, but it adds a dependency and shifts article ownership away from the app database.

### Decision: Use existing context documents as the source of truth and add a tracker as the missing control artifact

The current roadmap, architecture, MVP specification, and webhook notes remain the authoritative planning documents. Phase 0 adds the missing tracker and explicitly freezes the assumptions that Phase 1 must honor.

Why this decision:
- It avoids duplicating product and architecture decisions across multiple planning files.
- It keeps implementation tracking separate from product requirements and technical design.

Alternatives considered:
- Rewrite all existing context into a new master document.
  - More centralized, but redundant and likely to drift.
- Use only the roadmap without a tracker.
  - Simpler, but insufficient for status, dependency, and blocker management across phases.

### Decision: Freeze architectural guardrails before any scaffolded code is added

Implementation will follow the modular monolith and clean architecture boundaries already chosen: `core` owns entities, policies, and use cases; adapters own Stripe, Prisma, Auth.js, and queue integrations; `web` and `worker` stay thin.

Why this decision:
- It protects testability and keeps billing and access logic reusable across delivery layers.
- It prevents a common early-stage failure mode where route handlers and React components accumulate business rules.

Alternatives considered:
- Allow pragmatic boundary bending during bootstrap.
  - Faster to write initially, but increases cleanup cost once billing and webhook flows become complex.

## Risks / Trade-offs

- [Planning overhead delays coding] -> Keep the change narrow: freeze assumptions, add the tracker, and stop before scaffolding.
- [Context drift between docs and tracker] -> Make the tracker reference the existing context files instead of restating all details.
- [Manual seeding limits operational flexibility] -> Accept this as intentional MVP debt and defer authoring tooling to a later change.
- [Teams treat guidance as optional] -> Use the tracker exit criteria and code review rules as enforcement points before Phase 1 proceeds.

## Migration Plan

1. Create the implementation tracker in `.agents/context/`.
2. Align the tracker with the roadmap phases and exit criteria.
3. Explicitly record the frozen MVP assumptions, including manual article seeding.
4. Validate that Phase 0 exit criteria are satisfied.
5. Hand off to Phase 1 scaffolding work as a separate implementation step.

Rollback is low risk because this change only adds planning artifacts. If needed, the change can be revised without affecting runtime systems.

## Open Questions

- None for Phase 0. The remaining planning assumption about article management has been resolved: manual seeding is the MVP path.
