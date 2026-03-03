## Context

Phase 4 introduced Stripe catalog binding types and lookup helpers in `packages/infrastructure`, but they are still fed by hardcoded arrays in tests and composition call sites. That keeps billing-related code compiling, yet it leaves the actual product catalog undefined for runtime environments and makes Phase 8 checkout work depend on ad hoc configuration choices instead of a validated contract.

The MVP scope is intentionally small: three Stripe products (`starter`, `pro`, `ultra`) and six recurring prices across monthly and yearly intervals. Phase 7 should lock that matrix into one infrastructure-owned source of truth without moving Stripe identifiers into `packages/core` or introducing a heavier catalog subsystem than the MVP needs.

## Goals / Non-Goals

**Goals:**
- Define the six supported MVP catalog bindings in one infrastructure-owned runtime surface
- Load Stripe product and price identifiers from typed environment-backed configuration
- Fail clearly when required catalog identifiers are missing, duplicated, or internally inconsistent
- Reuse the existing Stripe catalog resolver and metadata helpers instead of replacing them
- Document the Stripe dashboard setup and environment variables needed for local and deployed environments

**Non-Goals:**
- Implement Checkout routes or billing portal entry points
- Introduce database-backed catalog management or admin tooling
- Change the Phase 3 plan tier or billing interval model
- Add discounts, trials, coupons, metered billing, or per-article Stripe products

## Decisions

### Decision: Keep catalog configuration in infrastructure, not core

Stripe product and price identifiers are external integration details, so the environment-backed binding loader will live in `packages/infrastructure`. `packages/core` will continue to speak only in terms of `PlanSelection`, `CatalogPlan`, and resolver interfaces.

Why this decision:
- It preserves the anti-corruption boundary already established between the core and Stripe.
- It lets runtime configuration, validation, and Stripe metadata live beside the existing Stripe adapter code.

Alternatives considered:
- Move the full six-plan catalog into `packages/core`.
  - This centralizes the matrix, but it would pull Stripe-facing concerns closer to the domain than necessary.
- Store catalog bindings in the database now.
  - More flexible later, but it adds schema and admin complexity before the MVP needs dynamic catalog management.

### Decision: Introduce a typed catalog runtime loader that produces `StripeCatalogPlanBinding[]`

Phase 7 will add a loader that reads the required Stripe product and price identifiers from environment variables, assembles the six supported bindings, and validates the complete set before returning it for composition and billing helpers.

Why this decision:
- It keeps one deterministic path from environment variables to the binding array already used by the gateway and event normalizer.
- It avoids duplicating the catalog matrix across environment parsing, tests, and Stripe adapter code.

Alternatives considered:
- Keep passing raw arrays manually into composition code.
  - Faster in the short term, but it leaves each caller responsible for building and validating the same six entries.
- Read the catalog directly from Stripe at startup.
  - More dynamic, but it adds API dependency and ambiguity to local development when a static MVP contract is enough.

### Decision: Wire composition and test helpers through the shared catalog binding surface

The infrastructure composition helpers and test fixtures should consume the same binding builder semantics so the code used in tests matches the structure expected in runtime environments.

Why this decision:
- It reduces drift between test-only plan arrays and production wiring.
- It keeps Phase 8 checkout work focused on route delivery instead of catalog cleanup.

Alternatives considered:
- Leave test helpers as separate hardcoded arrays.
  - Simpler, but it creates two catalog definitions that can diverge silently.
- Fully remove test-specific helpers.
  - Cleaner long-term, but unnecessary if helpers can wrap the shared binding creation path.

### Decision: Document Stripe dashboard setup in-repo now

Phase 7 will add a repository document that names the three Stripe products, six recurring prices, and corresponding environment variables required for local and deployed configuration.

Why this decision:
- The MVP catalog is small enough that explicit setup notes are faster and clearer than a more automated provisioning path.
- It gives the team a durable reference before checkout and webhook phases depend on exact Stripe identifiers.

Alternatives considered:
- Leave setup knowledge implicit in `.env.example` only.
  - Lower effort, but weaker for onboarding and Stripe dashboard consistency.
- Add Stripe API provisioning scripts now.
  - Potentially useful later, but too much operational scope before billing flows exist.

## Risks / Trade-offs

- [Catalog env surface becomes verbose] -> Group variables predictably by tier and interval so it stays explicit and searchable.
- [Runtime and test bindings drift] -> Reuse shared binding helpers and add focused validation tests.
- [Future billing features need richer catalog metadata] -> Keep the binding type extensible, but scope Phase 7 to the MVP product and price identifiers only.
- [Missing Stripe IDs fail late in checkout work] -> Validate the full catalog during runtime configuration loading and composition setup.

## Migration Plan

1. Add the typed catalog runtime configuration and binding loader in `packages/infrastructure`.
2. Update Stripe catalog helpers and composition code to consume the shared binding loader where runtime configuration is available.
3. Update `.env.example`, helper utilities, and repository documentation to reflect the required Stripe product and price identifiers.
4. Add focused tests for binding loading, validation, and resolution.
5. Verify the workspace lint, typecheck, test, and build flows before Phase 8 begins.

Rollback is low risk because Phase 7 only adds configuration, validation, and documentation surfaces on top of existing Stripe adapter code. The fallback path is to keep using explicit test-only bindings while removing the new runtime catalog loader if needed.

## Open Questions

- None for proposal readiness. The exact environment variable names can be finalized during implementation as long as they remain explicit per tier and interval and are documented consistently.
