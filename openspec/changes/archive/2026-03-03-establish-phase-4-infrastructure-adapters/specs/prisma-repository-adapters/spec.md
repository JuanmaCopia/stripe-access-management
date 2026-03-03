## ADDED Requirements

### Requirement: Infrastructure must provide Prisma-backed implementations of the core repositories
The infrastructure layer SHALL implement the Phase 3 repository ports for identity, content, subscriptions, and Stripe webhook inbox persistence using Prisma through the shared `@stripe-access-management/database` package. These adapters MUST be usable by later web and worker composition code without requiring direct Prisma usage outside infrastructure.

#### Scenario: Real repository composition review
- **WHEN** a developer composes a Phase 3 use case with real persistence in a later phase
- **THEN** the required repository implementations SHALL already exist in `packages/infrastructure` and depend on the shared database package rather than ad hoc Prisma client creation

### Requirement: Prisma repository adapters must preserve the anti-corruption boundary
Prisma-backed adapters SHALL map database records into core-owned entities, value objects, and DTO shapes instead of exposing Prisma model types or query payloads to callers. The adapter surface MUST satisfy the core port contracts without leaking ORM-specific structures.

#### Scenario: Repository type review
- **WHEN** a developer inspects the public types returned by an infrastructure repository adapter
- **THEN** the adapter SHALL return only core-owned types or transport-neutral values defined by the core port contract

### Requirement: Subscription and webhook persistence adapters must support idempotent projection workflows
The infrastructure persistence adapters SHALL support the Phase 3 subscription projection and webhook inbox workflows, including finding subscriptions by local user and Stripe subscription ID, upserting the local subscription projection, detecting duplicate webhook events by Stripe event ID, and recording durable inbox rows for asynchronous processing.

#### Scenario: Durable webhook persistence review
- **WHEN** the webhook intake flow records a Stripe event and later sync logic loads or updates the related subscription projection
- **THEN** the infrastructure persistence adapters SHALL provide the lookup and upsert behavior required by the Phase 3 core use cases
