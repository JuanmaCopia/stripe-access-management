## Why

The project already has strong planning context, but Phase 0 is not actually complete because the implementation tracker is missing and a few MVP assumptions still need to be frozen before scaffolding begins. Closing that gap now reduces the risk of leaking billing, auth, or database decisions into the wrong architectural layer once Phase 1 starts.

## What Changes

- Create a formal Phase 0 implementation baseline that turns the existing roadmap, architecture, and MVP notes into an apply-ready delivery contract.
- Add an implementation tracker artifact that records phases, exit criteria, dependencies, blockers, and status from Phase 0 through Phase 13.
- Freeze the MVP planning assumptions that Phase 1 depends on, including manual article seeding for the MVP, tier-based local access control, Stripe-hosted billing flows, and a separate worker with a Postgres-backed queue.
- Capture the boundary rules that implementation must follow so core business logic stays inside use cases and policies rather than route handlers, React components, Prisma models, or Stripe SDK objects.

## Capabilities

### New Capabilities
- `implementation-governance`: Defines the frozen MVP scope, non-goals, architectural boundaries, and Phase 1 handoff rules that govern implementation.
- `implementation-tracking`: Defines the tracker used to manage delivery progress, dependencies, blockers, and exit criteria across implementation phases.

### Modified Capabilities

None.

## Impact

- Affects planning artifacts under `.agents/context/`
- Adds an implementation tracker expected by the roadmap
- Clarifies the contract for future work in `apps/web`, `apps/worker`, and shared packages
- Reduces risk of boundary violations when Phase 1 scaffolding begins
