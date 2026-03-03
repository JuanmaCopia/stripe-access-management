## 1. Establish the infrastructure package and runtime support surface

- [x] 1.1 Replace the `packages/infrastructure` placeholder with module folders and exports for database repositories, Stripe, queueing, auth scaffolding, config, logging, and composition
- [x] 1.2 Add the Phase 4 dependencies and scripts needed for Stripe, `pg-boss`, and adapter-level verification without introducing unrelated platform tooling
- [x] 1.3 Implement typed runtime configuration, logging utilities, and composition helpers that later web and worker code can use to assemble core use cases with real adapters

## 2. Implement Prisma-backed repository adapters

- [x] 2.1 Implement the identity and content repository adapters through `@stripe-access-management/database` with explicit Prisma-to-core mappers
- [x] 2.2 Implement the subscription and Stripe webhook inbox repository adapters, including lookup, duplicate-detection, and projection upsert behavior required by the core ports
- [x] 2.3 Verify the Prisma-backed adapters satisfy the Phase 3 repository contracts without leaking Prisma model types beyond infrastructure

## 3. Implement Stripe and queue adapters

- [x] 3.1 Implement the Stripe billing gateway for checkout and billing portal initiation using internal plan and user contracts
- [x] 3.2 Implement Stripe anti-corruption mappers and normalized billing-event translation for the supported MVP webhook events
- [x] 3.3 Implement the `pg-boss` queue adapter and internal job contracts for publishing and consuming webhook-processing work against the shared PostgreSQL instance

## 4. Add auth scaffolding and adapter verification

- [x] 4.1 Add Auth.js-oriented infrastructure scaffolding that later authentication work can reuse without pulling Auth.js types into the core
- [x] 4.2 Add selective adapter and integration tests for Prisma repositories, Stripe mapping, queue publish or consume behavior, and composition smoke coverage
- [x] 4.3 Verify the workspace builds, typechecks, and tests cleanly and that Phase 3 core use cases can be composed with real infrastructure adapters
