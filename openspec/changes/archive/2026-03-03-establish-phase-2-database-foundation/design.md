## Context

Phase 1 created the workspace shell, but there is still no database runtime, no Prisma schema, no migration history, and no local seed flow. Phase 2 must establish a persistence baseline that supports the MVP's tier-based content model, Auth.js session storage, and Stripe subscription projection without letting Prisma leak into the core domain.

This change is cross-cutting because it affects the data contract for authentication, content, subscriptions, webhook intake, and future infrastructure adapters. It also introduces two long-lived infrastructure choices: PostgreSQL as the primary data store and Prisma as the ORM and migration tool.

## Goals / Non-Goals

**Goals:**
- Add PostgreSQL and Prisma as the database foundation for the monorepo
- Define the initial schema for users, auth persistence, articles, subscriptions, and webhook inbox records
- Create the first migration and a repeatable local seed workflow
- Expose Prisma through `packages/database` so later phases have a shared persistence entry point

**Non-Goals:**
- Implement repository adapters or business use cases
- Implement Stripe clients, webhook processors, or queue consumers
- Finalize production database hosting or deployment automation
- Add admin content authoring features beyond seeded development content

## Decisions

### Decision: Use PostgreSQL plus Prisma as the Phase 2 persistence baseline

The project will use PostgreSQL for storage and Prisma for schema management, migrations, and generated client access.

Why this decision:
- It matches the architecture documents and supports both application data and future queue integration on the same database platform.
- Prisma gives the team a fast path to migrations and type-safe data access without hand-writing low-level SQL for every persistence concern.

Alternatives considered:
- Drizzle ORM.
  - Leaner in some workflows, but diverges from the documented plan and adds decision churn immediately after Phase 1.
- Raw SQL or a hand-rolled query layer.
  - More explicit, but slower to ship and harder to evolve safely during MVP iteration.

### Decision: Model the MVP schema around projections, not direct Stripe runtime reads

The initial schema will store the local subscription projection required by authorization, including plan tier, billing interval, Stripe status, cancel-at-period-end, access expiration, and synchronization timestamps.

Why this decision:
- It matches the MVP access model and keeps article reads independent of live Stripe API calls.
- It gives webhook processing and reconciliation a stable local target for idempotent updates.

Alternatives considered:
- Query Stripe directly on article reads.
  - Simpler upfront, but slower, less reliable, and explicitly against the chosen architecture.
- Store per-article access grants instead of tier projections.
  - More granular, but unnecessary complexity for the MVP's inherited tier model.

### Decision: Use the standard Auth.js Prisma persistence shape where it lowers future friction

The schema will include the local user record plus the standard persistence models needed by the Auth.js Prisma adapter for account and session storage.

Why this decision:
- It reduces future adapter friction in Phase 5.
- It keeps the auth persistence model compatible with the common Auth.js workflow instead of inventing a custom shape too early.

Alternatives considered:
- Create only custom `users`, `accounts`, and `sessions` tables tailored to today's Google-only scope.
  - Slightly smaller schema, but more likely to create avoidable adapter work later.

### Decision: Treat the webhook inbox as an application table, not an ephemeral log

The schema will include a dedicated Stripe webhook inbox table with a unique Stripe event ID, raw payload storage, processing status, timestamps, and error fields needed for durable intake and retries.

Why this decision:
- It supports the inbox and idempotent-consumer patterns already chosen in architecture.
- It creates the stable persistence contract that later webhook intake and worker phases can build against.

Alternatives considered:
- Store webhook events only in logs.
  - Easier initially, but not durable enough for retries, deduplication, or support diagnostics.
- Reuse a generic jobs table.
  - Less explicit and weaker fit for Stripe event auditing.

### Decision: Keep queue-table ownership with `pg-boss`, not hand-modeled Prisma entities

Phase 2 will prepare the database package for future `pg-boss` usage, but it will not hand-model `pg-boss` internals as first-class Prisma models.

Why this decision:
- `pg-boss` manages its own schema objects and lifecycle.
- Hand-modeling queue internals now would create coupling to implementation details the application does not need to own.

Alternatives considered:
- Create manual Prisma models for future queue tables now.
  - More visible upfront, but the wrong ownership boundary for a library-managed queue.

### Decision: Restrict Prisma access to the shared database package

`packages/database` will own Prisma schema files, generated client access, migration commands, and seed entry points. Later phases may depend on that package, but core business logic must not depend on Prisma types or direct client imports.

Why this decision:
- It preserves the clean-architecture boundary established in Phase 0.
- It gives future infrastructure adapters a single persistence entry point.

Alternatives considered:
- Let apps and packages instantiate Prisma directly.
  - Faster in the short term, but it spreads ORM coupling through the codebase immediately.

## Risks / Trade-offs

- [Schema decisions harden too early] -> Keep the schema aligned to the MVP projection and defer advanced optimizations until real access patterns emerge.
- [Auth.js compatibility assumptions drift] -> Use the standard Prisma adapter model shape unless a real blocker appears during implementation.
- [Prisma coupling leaks into core or UI code] -> Keep client creation and exports inside `packages/database` and reinforce boundary rules in code review.
- [Seed data becomes mistaken for product authoring] -> Limit Phase 2 seeding to development fixtures and keep authoring workflows explicitly out of scope.

## Migration Plan

1. Add Prisma and database tooling dependencies to the workspace.
2. Create the Prisma schema under `packages/database/prisma`.
3. Model the initial tables and enums for auth persistence, articles, subscriptions, and webhook inbox records.
4. Create the first migration and document local database bootstrapping.
5. Add a seed entry point with representative articles across the three tiers.
6. Expose Prisma access through `packages/database/src`.

Rollback is moderate because migrations become part of repository history. If the schema needs revision before other phases depend on it, it is still cheaper to adjust now than after repository adapters and auth flows are built.

## Open Questions

- None for proposal readiness. The remaining details are implementation-level choices inside the documented schema and boundary rules.
