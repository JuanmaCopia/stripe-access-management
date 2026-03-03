# database-schema-foundation Specification

## Purpose
TBD - created by archiving change establish-phase-2-database-foundation. Update Purpose after archive.
## Requirements
### Requirement: The project must provide a local PostgreSQL and Prisma database baseline
The repository SHALL provide the database foundation needed for local development with PostgreSQL and Prisma. The workspace MUST include a Prisma schema, a generated Prisma client workflow, and documented commands or scripts for local database setup and migration execution.

#### Scenario: Local database bootstrap
- **WHEN** a developer begins Phase 2 setup on a fresh machine
- **THEN** the repository SHALL provide the Prisma assets and local workflow needed to create and migrate the project database

### Requirement: The initial schema must support the MVP persistence model
The initial Prisma schema SHALL model the MVP persistence contract for users, auth persistence, articles, subscriptions, and Stripe webhook inbox records. The schema MUST include the enums and fields needed for `plan_tier`, billing interval, local Stripe status projection, `cancel_at_period_end`, and `access_expires_at`.

#### Scenario: Persistence contract review
- **WHEN** a developer inspects the initial Prisma schema
- **THEN** the schema SHALL contain the tables and enum fields needed to support Auth.js persistence, article storage, subscription projection, and durable webhook intake for the MVP

### Requirement: The database baseline must include migration history and development seed data
The Phase 2 database foundation SHALL include the first migration and a repeatable seed strategy for local development. The seed flow MUST create representative article content across the Starter, Pro, and Ultra tiers without introducing admin authoring features.

#### Scenario: Development seed run
- **WHEN** a developer runs the seed workflow after applying the initial migration
- **THEN** the local database SHALL contain representative seeded content that supports later content and access testing

