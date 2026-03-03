## Why

Phase 3 established the core use cases and ports, but the application still cannot compose them with real persistence, billing, queueing, logging, or auth integration surfaces. Phase 4 needs to implement those adapters now so the web and worker layers can call the core through concrete infrastructure without leaking Prisma, Stripe, or framework details back into `packages/core`.

## What Changes

- Replace the `packages/infrastructure` placeholder with real adapter modules that implement the Phase 3 repository and gateway ports.
- Add Prisma-backed repository adapters for users, articles, subscriptions, and the Stripe webhook inbox using the shared `@stripe-access-management/database` package.
- Add a Stripe gateway, anti-corruption mappers, and normalized billing-event translation that can serve checkout, billing portal, and subscription sync flows without exposing Stripe SDK objects to the core.
- Add a `pg-boss` queue adapter plus the supporting composition surfaces needed for webhook processing and future worker consumption.
- Add configuration, logging, and Auth.js adapter scaffolding so later phases can compose web and worker entry points against stable infrastructure services.
- Add infrastructure-level tests where they provide meaningful confidence around adapter behavior and composition boundaries.

## Capabilities

### New Capabilities
- `prisma-repository-adapters`: Defines the Prisma-backed repository implementations that satisfy the core content, identity, subscription, and webhook persistence ports through the shared database package.
- `stripe-and-queue-adapters`: Defines the Stripe gateway, Stripe-to-core mappers, normalized event translation, and `pg-boss` queue adapter needed to back billing and webhook flows.
- `runtime-support-adapters`: Defines the configuration, logging, and Auth.js scaffolding surfaces that let later delivery layers compose real infrastructure without moving business rules out of the core.

### Modified Capabilities

None.

## Impact

- Affects `packages/infrastructure` as the primary implementation surface and likely touches root workspace dependencies and scripts
- Builds directly on the existing core port contracts in `packages/core` and the Prisma boundary in `packages/database`
- Introduces or wires the main external integration dependencies for Stripe, `pg-boss`, logging, and auth scaffolding
- Creates the composition foundation required by Phases 5 through 9 without changing the core business rules already locked in Phase 3
