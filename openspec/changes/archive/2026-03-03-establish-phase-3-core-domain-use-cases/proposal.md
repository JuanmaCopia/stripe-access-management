## Why

Phases 1 and 2 created the workspace and persistence foundation, but the repository still lacks the core business model that decides who can read which content, when access expires, and how billing flows are represented without leaking Stripe or Prisma details into the application center. Phase 3 needs to establish that domain now so later web, worker, and infrastructure work composes around stable use cases instead of re-embedding business rules in adapters.

## What Changes

- Create the first real module structure inside `packages/core` for `identity`, `content`, `catalog`, `subscriptions`, and `access`.
- Define the shared kernel, entities, value objects, policies, repository ports, and external gateway ports that Phase 4 adapters will implement.
- Implement the MVP plan hierarchy and article access rules as pure domain logic that can be tested without Next.js, Prisma, or Stripe.
- Add interface-driven application use cases for dashboard article listing, article reads, checkout start, billing portal access, Stripe webhook recording, and Stripe subscription synchronization.
- Add focused unit tests that lock the plan hierarchy, access decisions, and use-case boundary rules before infrastructure wiring begins.

## Capabilities

### New Capabilities
- `core-domain-foundation`: Defines the module boundaries, shared kernel, entities, value objects, policies, and ports that make `packages/core` the application's business-logic center.
- `content-access-use-cases`: Defines the dashboard and article-reading use cases plus the tier and paid-period access behavior they must enforce.
- `subscription-billing-orchestration`: Defines the interface-driven checkout, billing portal, webhook intake, and Stripe synchronization use cases that coordinate billing behavior without depending on concrete adapters.

### Modified Capabilities

None.

## Impact

- Affects `packages/core` module structure, package exports, and unit-test coverage
- Establishes the contracts that future Prisma, Stripe, queue, and auth adapters must implement
- Gives `apps/web` and `apps/worker` stable use-case entry points for later delivery-layer composition
- Reduces the risk of billing and access rules drifting into route handlers, React components, or infrastructure code
