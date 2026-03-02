## Why

Phase 1 created the monorepo shell, but the application still has no durable data model for users, content, subscriptions, or webhook intake. Phase 2 needs to establish the database foundation now so later domain and infrastructure work can build against a stable persistence contract without leaking Prisma concerns across architectural boundaries.

## What Changes

- Add PostgreSQL and Prisma as the database foundation for the project.
- Create the initial Prisma schema for users, auth persistence, articles, subscriptions, and Stripe webhook inbox records.
- Define the enums and persistence fields required for tier-based access control and Stripe lifecycle projection.
- Add the first migration and a seed strategy for local development.
- Expose Prisma through the `packages/database` package so later phases depend on a shared database boundary instead of raw ORM access scattered across the workspace.

## Capabilities

### New Capabilities
- `database-schema-foundation`: Defines the initial persistence schema, enums, migration, and local seed strategy for the MVP data model.
- `database-package-boundary`: Defines how Prisma is initialized and exposed through the shared database package without leaking ORM implementation details across the codebase.

### Modified Capabilities

None.

## Impact

- Affects `packages/database`, Prisma schema and migration files, and local developer database setup
- Establishes the persistence contract used by later auth, content, subscription, and webhook phases
- Introduces PostgreSQL and Prisma as core infrastructure dependencies
- Reduces the risk of Prisma coupling spreading into UI, route handlers, or core domain code
