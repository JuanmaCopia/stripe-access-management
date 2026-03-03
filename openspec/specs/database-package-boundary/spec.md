# database-package-boundary Specification

## Purpose
TBD - created by archiving change establish-phase-2-database-foundation. Update Purpose after archive.
## Requirements
### Requirement: Prisma access must be owned by the shared database package
The repository SHALL centralize Prisma ownership inside `packages/database`. The Prisma schema, generated client access, migration entry points, and seed entry point MUST live behind that package rather than being defined independently inside apps or unrelated packages.

#### Scenario: Database package review
- **WHEN** a developer reviews how Prisma is wired into the workspace
- **THEN** the repository SHALL expose Prisma through `packages/database` as the shared persistence entry point

### Requirement: The database boundary must discourage ORM leakage into the rest of the codebase
The Phase 2 database foundation SHALL expose a shared client wrapper or equivalent package surface that later infrastructure code can depend on, while core business logic MUST NOT depend directly on Prisma models or generated client imports.

#### Scenario: Clean architecture review
- **WHEN** a developer adds persistence-dependent code in later phases
- **THEN** the database foundation SHALL already define a package boundary that keeps direct Prisma usage out of the core domain layer

### Requirement: Queue persistence ownership must remain outside the application schema
The database foundation SHALL prepare the project to use the shared PostgreSQL instance for future queueing, but it MUST NOT hand-model library-managed `pg-boss` internals as Prisma application models during Phase 2.

#### Scenario: Queue support review
- **WHEN** the Phase 2 schema is reviewed against future queue needs
- **THEN** the database foundation SHALL support a shared PostgreSQL strategy without turning `pg-boss` internals into application-owned Prisma entities

