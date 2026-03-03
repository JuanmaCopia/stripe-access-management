## ADDED Requirements

### Requirement: The core package must expose module-oriented business boundaries
The repository SHALL organize `packages/core` around the `identity`, `content`, `catalog`, `subscriptions`, and `access` modules plus a shared kernel. Each module MUST separate pure domain concerns from application orchestration so later adapters depend on stable business boundaries instead of embedding rules locally.

#### Scenario: Core package structure review
- **WHEN** a developer inspects `packages/core` after Phase 3 implementation
- **THEN** the package SHALL expose the planned business modules and a shared kernel with clear domain and application separation

### Requirement: Core application contracts must remain infrastructure-agnostic
The Phase 3 core domain SHALL define repository ports, gateway ports, and use case contracts without importing Prisma, Stripe, Auth.js, Next.js, or queue implementation types. Core use cases MUST compile against core-owned interfaces and neutral data structures only.

#### Scenario: Use case dependency review
- **WHEN** a developer reviews imports used by Phase 3 use cases
- **THEN** the use cases SHALL depend only on core-owned domain types, value objects, DTOs, and interfaces

### Requirement: Core business rules must be verified with pure unit tests
The core package SHALL include unit tests for plan ordering, access decisions, and use-case orchestration behavior using fake or in-memory ports instead of live infrastructure dependencies.

#### Scenario: Core rule regression review
- **WHEN** a developer runs the Phase 3 core test suite
- **THEN** the plan hierarchy, access policy, and interface-driven use cases SHALL be exercised without requiring Next.js, Prisma, Stripe, or a running queue
