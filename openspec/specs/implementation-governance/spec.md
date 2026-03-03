# implementation-governance Specification

## Purpose
TBD - created by archiving change establish-phase-0-baseline. Update Purpose after archive.
## Requirements
### Requirement: MVP implementation scope must be frozen before Phase 1
The project SHALL freeze the MVP implementation scope before Phase 1 scaffolding begins. The frozen scope MUST include manual article seeding for MVP content, three subscription tiers, monthly and yearly billing, Stripe-hosted Checkout and Customer Portal, local tier-based access checks using `access_expires_at`, Auth.js with Google login, a separate worker, and a Postgres-backed queue.

#### Scenario: Phase 1 readiness review
- **WHEN** the team reviews whether Phase 1 can begin
- **THEN** the implementation baseline SHALL show the agreed MVP scope and non-goals without requiring additional product-definition work

### Requirement: Architectural boundaries must be defined before implementation
The project SHALL define implementation boundaries before code scaffolding begins. The baseline MUST state that business entities, policies, and use cases belong in the core layer, external integrations belong in adapters, and delivery layers MUST remain thin and MUST NOT own billing rules, access rules, or direct Prisma usage in React components.

#### Scenario: Boundary validation before scaffolding
- **WHEN** implementation guidance is reviewed for Phase 1
- **THEN** the baseline SHALL identify the allowed dependency directions and the prohibited boundary violations that code review must enforce

### Requirement: Billing and access truth rules must be frozen before implementation
The project SHALL freeze the billing and access synchronization rules before implementation starts. The baseline MUST define `invoice.paid` as the access grant or extension signal, MUST define local access data as the runtime authorization source, and MUST require webhook intake to verify signatures, persist raw events, enqueue work, and return quickly.

#### Scenario: Stripe flow planning review
- **WHEN** the team prepares to implement checkout, webhooks, and access enforcement
- **THEN** the baseline SHALL provide a single agreed set of access and webhook rules that Phase 1 and later phases build against

