## Context

Phases 1 and 2 are now complete, so the repository has a stable workspace shell and database foundation but still no actual business-logic center. `packages/core` remains a placeholder, which means article access rules, plan hierarchy, checkout decisions, and Stripe synchronization behavior would otherwise be forced into route handlers, workers, or infrastructure adapters as those phases begin.

Phase 3 is cross-cutting because it establishes the contracts that `apps/web`, `apps/worker`, `packages/infrastructure`, and `packages/database` will all compose around. The design must preserve the clean-architecture boundary already frozen in Phase 0: pure business rules in the core, external systems behind ports, and delivery layers limited to composition and presentation.

## Goals / Non-Goals

**Goals:**
- Create the first real `packages/core` structure around the `identity`, `content`, `catalog`, `subscriptions`, and `access` modules
- Define the shared kernel, domain entities, value objects, policies, and application ports needed by the MVP
- Implement interface-driven use cases for dashboard listing, article reads, checkout, billing portal, webhook intake, and Stripe subscription sync
- Lock the plan hierarchy and local access rules behind fast unit tests before adapters exist

**Non-Goals:**
- Implement Prisma repositories, Stripe SDK clients, Auth.js adapters, or queue consumers
- Compose use cases into Next.js routes, React components, or worker handlers
- Finalize presentation-layer DTOs or page view models beyond what core use cases need
- Add new runtime dependencies beyond the existing TypeScript and test tooling stack

## Decisions

### Decision: Organize `packages/core` by business module with explicit `domain` and `application` layers

`packages/core` will follow the architecture document directly: `modules/identity`, `modules/content`, `modules/catalog`, `modules/subscriptions`, and `modules/access`, each split into `domain` and `application`, plus a `shared/kernel` area for cross-cutting primitives such as errors, time, IDs, and result types.

Why this decision:
- It keeps related rules, ports, and use cases close together instead of scattering them by technical type across the package.
- It makes boundary violations easier to spot during Phase 4 and later, because adapters must depend inward on clearly named application contracts.

Alternatives considered:
- Organize `packages/core` by type such as `entities/`, `repositories/`, and `use-cases/`.
  - Simpler to start, but it weakens module ownership and makes future refactors harder as the domain grows.
- Keep a single flat application layer for the MVP.
  - Faster for a few files, but it invites cross-module coupling immediately.

### Decision: Express plan, subscription, and access rules as pure domain objects and policies

The plan hierarchy, subscription access state, and article access evaluation will live in pure domain code with no dependency on Prisma enums, Stripe types, or delivery-layer concerns. The domain will treat local subscription truth as the runtime authorization source and evaluate access from plan tier, paid-through date, and local subscription status.

Why this decision:
- It matches the MVP requirement that access checks stay local and do not call Stripe during article reads.
- It gives the project a single place to test the most important business rules before any adapter code exists.

Alternatives considered:
- Reuse database or Stripe enums as the domain model.
  - Slightly less mapping work, but it leaks infrastructure concerns into core logic and makes tests less stable.
- Compute access ad hoc inside article and webhook handlers.
  - Faster initially, but it duplicates rules and makes regressions likely.

### Decision: Define ports in the application layer and keep them free of external SDK and ORM types

Use cases will depend on repository ports, billing gateway ports, queue publishing ports, clock abstractions, and session or identity lookups that are expressed in core-owned types. Port method signatures will use core entities, value objects, and DTOs rather than Prisma records, Auth.js sessions, or Stripe SDK payloads.

Why this decision:
- It preserves the clean-architecture contract and keeps use cases portable across web, worker, and test environments.
- It gives Phase 4 clear adapter seams without locking the core to any one SDK or persistence library.

Alternatives considered:
- Allow ports to expose Prisma or Stripe types directly for speed.
  - Lower short-term ceremony, but it spreads coupling and makes the core harder to test.
- Hide everything behind one large application service interface.
  - Fewer files, but it obscures ownership and creates a harder-to-maintain god interface.

### Decision: Model billing-facing use cases as orchestration, not transport handlers

`StartCheckout`, `OpenBillingPortal`, `RecordStripeWebhook`, and `SyncStripeSubscription` will be core application services that coordinate domain rules through ports and return transport-neutral outcomes. They will not know about Next.js route objects, worker consumers, or Stripe webhook signature verification.

Why this decision:
- It lets the web and worker delivery layers stay thin while the real billing and access rules remain reusable and testable.
- It separates transport concerns such as HTTP status codes and signature verification from durable business decisions such as duplicate-subscription prevention and access-extension rules.

Alternatives considered:
- Implement billing flows directly in route handlers or worker consumers.
  - Faster to demo, but it violates the architecture and makes later testing and reuse harder.
- Delay billing orchestration use cases until Stripe adapters exist.
  - Lower upfront effort, but it would push business-rule design into infrastructure work where it is harder to correct.

### Decision: Use pure unit tests with fakes to lock behavior before infrastructure arrives

Phase 3 testing will focus on deterministic unit tests in `packages/core`, using fake repositories, fake billing gateways, fake queue publishers, and controlled clocks to verify the plan hierarchy, access evaluation, and application-service orchestration.

Why this decision:
- It gives fast feedback on the rules that matter most before Prisma, Stripe, and Auth.js are introduced into the execution path.
- It keeps Phase 3 pragmatic by proving behavior without needing integration environments.

Alternatives considered:
- Wait for infrastructure adapters and rely on integration tests later.
  - More realistic end-to-end, but much slower to debug and too late to catch boundary drift.

## Risks / Trade-offs

- [Domain modeling adds upfront structure before visible UI progress] -> Keep the scope limited to the roadmap's MVP modules and use cases, and defer presentation concerns to later phases.
- [Ports become over-abstracted] -> Define only the interfaces required by the listed Phase 3 use cases, not speculative extension points.
- [Core types drift from the database schema or Stripe payloads] -> Treat Phase 2 schema and webhook documents as input constraints and keep mappings explicit in later adapters.
- [Billing orchestration rules are underspecified before real adapters land] -> Encode the frozen MVP webhook and access rules directly in specs and unit tests now so later phases implement a fixed contract.

## Migration Plan

1. Replace the `packages/core` placeholder with the shared kernel and module-oriented folder structure.
2. Introduce the core entities, value objects, and policies for catalog, subscriptions, content, and access.
3. Define the repository and gateway ports needed by the Phase 3 use cases.
4. Implement the initial application services for dashboard listing, article reads, checkout, billing portal, webhook recording, and Stripe synchronization.
5. Add unit tests that verify plan ordering, access decisions, and use-case orchestration with fake ports.
6. Export the new `packages/core` surfaces so later phases can compose them from infrastructure and delivery layers.

Rollback is low risk because this phase is additive inside `packages/core`. If the design needs revision before Phase 4 depends on it, the change can still be refactored without data migration costs.

## Open Questions

- None for proposal readiness. Remaining choices such as exact file names, error helpers, and result-shape utilities are implementation details inside the approved module boundaries.
