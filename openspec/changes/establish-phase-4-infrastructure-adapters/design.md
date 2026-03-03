## Context

Phase 3 is complete, so the repository now has concrete core ports and use cases for content access, checkout, billing portal access, webhook intake, and Stripe subscription synchronization. The missing piece is `packages/infrastructure`: it is still a placeholder, which means the web and worker layers have no real way to compose the core with Prisma persistence, Stripe-hosted billing, `pg-boss`, logging, configuration, or auth adapter scaffolding.

Phase 4 is cross-cutting because it touches every external system boundary that the core deliberately avoided: Prisma through the shared database package, Stripe through a billing gateway and event mappers, `pg-boss` through a queue adapter, and runtime support through config, logging, and Auth.js scaffolding. The design must preserve the Phase 0 and Phase 3 rule that the core owns business decisions while infrastructure owns SDK and framework details.

## Goals / Non-Goals

**Goals:**
- Replace the `packages/infrastructure` placeholder with real adapter modules that implement the core repository and gateway ports
- Add Prisma-backed adapters for content, identity, subscriptions, and webhook inbox persistence through `@stripe-access-management/database`
- Add Stripe billing and event-normalization adapters plus a `pg-boss` queue adapter that support checkout, portal, webhook, and reconciliation flows
- Add composition-ready config, logging, and Auth.js scaffolding surfaces that later phases can use in `web` and `worker`
- Add focused adapter and integration tests where they provide meaningful confidence around mappings, persistence behavior, and queue composition

**Non-Goals:**
- Configure Auth.js routes in `apps/web` or complete Google login flows
- Build user-facing pages, route handlers, or worker consumers that fully exercise every adapter end to end
- Change the core business rules, use-case outcomes, or database schema beyond what adapter composition requires
- Introduce a heavyweight DI framework, observability platform, or extra infrastructure beyond the existing Postgres, Prisma, Stripe, and `pg-boss` direction

## Decisions

### Decision: Implement infrastructure by adapter module, not by delivery app

`packages/infrastructure` will own concrete adapter modules for database repositories, Stripe, queueing, auth scaffolding, config, and logging, plus composition helpers that the web and worker apps can call later. Apps will depend on these adapters, but the adapters themselves will remain reusable and transport-agnostic.

Why this decision:
- It preserves the modular monolith boundaries already defined in the architecture.
- It prevents `apps/web` and `apps/worker` from becoming the place where SDK-specific logic quietly accumulates.

Alternatives considered:
- Implement adapters directly inside `apps/web` and `apps/worker`.
  - Faster to wire initially, but it weakens reuse and makes Phase 5 through Phase 9 harder to keep consistent.
- Add a full DI container or service locator now.
  - More flexible on paper, but too much ceremony for the current MVP scope.

### Decision: Keep Prisma adapter implementations behind explicit mappers and repository classes

Prisma-backed repositories will use the shared `@stripe-access-management/database` client, but each adapter will map database records into core-owned models rather than returning Prisma payloads directly. Repository methods will align with the Phase 3 port contracts and isolate Prisma query shapes inside infrastructure.

Why this decision:
- It keeps the anti-corruption boundary intact and prevents Prisma models from becoming de facto domain types.
- It makes future schema or ORM changes cheaper than if Prisma types spread into composition code.

Alternatives considered:
- Re-export Prisma model types from infrastructure for convenience.
  - Slightly less mapping work, but it reintroduces the coupling Phase 3 was designed to avoid.
- Put repository logic in the database package.
  - Faster short term, but it violates the clean split between low-level database ownership and higher-level adapter behavior.

### Decision: Introduce Stripe and `pg-boss` in Phase 4, but normalize them into core-owned contracts immediately

Phase 4 will add the concrete Stripe and `pg-boss` dependencies because the roadmap already chose them, but all adapter boundaries will normalize SDK data into the core contracts introduced in Phase 3. Stripe event parsing and price or subscription translation will happen in infrastructure mappers, and queue jobs will be expressed in internal intent types rather than raw SDK objects.

Why this decision:
- It aligns implementation with the locked MVP stack while preserving replacement flexibility.
- It ensures the webhook and billing flows can grow without turning core use cases into wrappers around Stripe object graphs.

Alternatives considered:
- Delay Stripe and queue dependencies until later web and worker phases.
  - Simpler today, but it pushes adapter design pressure into delivery code where boundary mistakes are harder to unwind.
- Expose raw Stripe event objects to the core because the supported event list is small.
  - Less ceremony, but directly conflicts with the anti-corruption rule in the architecture.

### Decision: Use lightweight runtime support adapters instead of a full platform layer

Configuration, logging, and Auth.js scaffolding will be implemented as small infrastructure modules and factories. Configuration will validate required adapter inputs early, logging will provide a stable application-facing surface over the current runtime, and Auth.js support will stop at reusable adapter scaffolding needed by Phase 5.

Why this decision:
- It gives later phases stable integration points without turning infrastructure into a platform rewrite.
- It keeps the MVP biased toward the existing stack and simple patterns.

Alternatives considered:
- Add a full structured logging library and central config framework now.
  - Potentially useful later, but it adds dependency and operational churn before the app has meaningful runtime complexity.
- Postpone config and auth scaffolding entirely.
  - Lower scope, but it makes the next phases re-open adapter boundaries that are cheaper to settle now.

### Decision: Favor selective integration tests over broad end-to-end infrastructure orchestration

Phase 4 verification will focus on adapter-level tests where the real integration boundary matters: Prisma repository behavior, Stripe event normalization, queue publish or consume behavior, and composition smoke tests. It will not attempt full user-flow end-to-end coverage yet.

Why this decision:
- It provides confidence in the highest-risk boundaries without dragging web and worker delivery concerns into the adapter phase.
- It keeps feedback loops short enough to support iterative adapter work.

Alternatives considered:
- Rely only on unit tests with mocks.
  - Faster to write, but too weak for persistence, queue, and mapper correctness.
- Try to build full end-to-end auth, checkout, and webhook flows in this phase.
  - More realistic, but it would balloon scope and overlap heavily with later phases.

## Risks / Trade-offs

- [Infrastructure scope grows into delivery implementation] -> Keep route handlers, page logic, and worker consumers out of this phase and validate every task against the adapter-only goal.
- [SDK details leak past adapter boundaries] -> Require explicit mappers at Prisma and Stripe boundaries and keep core contracts as the only types crossing into composition code.
- [New dependency churn slows development] -> Bias toward the already chosen stack (`@stripe-access-management/database`, Stripe, `pg-boss`, Auth.js scaffolding) instead of adding alternative libraries.
- [Queue and Stripe integration are hard to test deterministically] -> Use focused integration tests and normalized contract tests rather than broad end-to-end flows.
- [Auth scaffolding becomes premature abstraction] -> Limit it to reusable adapter surfaces needed by Phase 5 and defer web-specific configuration until that phase starts.

## Migration Plan

1. Replace the infrastructure placeholder with module folders for database repositories, Stripe, queueing, auth scaffolding, logging, config, and composition.
2. Add the required external dependencies and typed runtime configuration surfaces.
3. Implement Prisma-backed repository adapters through the shared database package and mapper layer.
4. Implement the Stripe gateway, Stripe event normalization, and anti-corruption mappers for plan, subscription, and webhook data.
5. Implement the `pg-boss` queue adapter and composition helpers needed for webhook publishing and future worker consumption.
6. Add selective integration and adapter tests, then verify the workspace can compose core use cases with real infrastructure adapters.

Rollback is moderate because new dependencies and adapter surfaces will become shared building blocks for later phases. It is still cheaper to correct these boundaries in Phase 4 than after delivery layers depend on them.

## Open Questions

- None for proposal readiness. Exact package names, environment variable names, and factory signatures can be settled during implementation as long as the adapter boundaries and dependency direction remain unchanged.
