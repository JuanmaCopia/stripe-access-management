# Implementation Tracker

This file tracks implementation progress for the MVP and records the phase-by-phase handoff contract for future work.

Last updated: March 3, 2026

Status legend:
- `[ ]` Not started
- `[-]` In progress
- `[x]` Done
- `[!]` Blocked

## Source Planning Artifacts

This tracker references the existing source documents rather than duplicating their full content:
- [implementation-roadmap.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/implementation-roadmap.md)
- [project-architecture.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/project-architecture.md)
- [mvp-specification.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/mvp-specification.md)
- [mvp-stripe-webhooks.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/mvp-stripe-webhooks.md)

## Current State Summary

Current implementation state:
- Phase 0 planning baseline is complete
- Phase 1 monorepo scaffolding and shared developer tooling are complete
- Phase 2 database foundation is complete, including Prisma schema, migration, seed flow, and shared package access
- Phase 3 core domain modules, policies, ports, use cases, and unit tests are complete
- Phase 4 infrastructure adapters are complete, including Prisma repositories, Stripe and queue adapters, auth scaffolding, logging, and runtime configuration
- Phase 5 Google authentication, local-user linking, session helpers, and protected member routes are complete
- Phase 6 seeded tiered content, public pricing shell, member dashboard, and protected article reader experience are complete
- Phase 7 Stripe catalog bindings, runtime configuration, and dashboard setup documentation are complete
- no production worker or queue runtime has been implemented

Current focus recommendation:
- begin Phase 8 and keep it focused on wiring authenticated checkout and billing portal entry points against the now-validated Stripe catalog

## Frozen MVP Implementation Baseline

The following assumptions are closed for the MVP and should not be reopened during Phase 1:
- content authoring is manual seeding or manual database insertion only
- no admin article editor or CMS integration is part of the MVP
- article access is enforced locally using `plan_tier` and `access_expires_at`
- Stripe-hosted Checkout and Customer Portal remain the billing flows
- Auth.js with Google remains the default MVP authentication adapter
- webhook work is acknowledged quickly in `web` and processed asynchronously in `worker`
- `pg-boss` remains the durable queue choice
- one user has one effective active subscription at a time for the MVP

## Implementation Guardrails

Boundary rules that Phase 1 and later phases must honor:
- `core` owns entities, value objects, policies, and use cases
- `infrastructure` owns adapters for Stripe, Prisma, Auth.js, queue, and logging
- `web` and `worker` are delivery layers and must stay thin

Prohibited implementation patterns:
- `core` importing framework code, Prisma models, or Stripe SDK objects
- React components importing Prisma directly
- route handlers containing billing lifecycle rules or article access rules
- live Stripe API calls during article reads
- Redis or another broker added only to support the queue

## Phase 1 Bootstrap Checklist

Phase 1 is complete. This checklist records the intentionally narrow scaffold scope that was delivered:
- initialize the workspace package manager setup
- create `apps/web`
- create `apps/worker`
- create `packages/core`
- create `packages/infrastructure`
- create `packages/database`
- create `packages/testing`
- add TypeScript workspace configuration
- add linting and formatting
- add environment variable loading strategy
- add shared scripts for `dev`, `build`, `test`, `lint`, and `typecheck`
- add path alias and package-boundary configuration

Phase 1 must not:
- implement business rules
- implement Stripe billing flows
- implement Prisma data models beyond the minimum needed for scaffolding decisions
- add article authoring features

## Delivery Phases

### Phase 0: Planning And Setup Baseline

- Status: `[x]`
- Goal: lock scope, architecture, and implementation order before coding starts
- Deliverables:
  - MVP scope and non-goals written down
  - architecture and folder structure written down
  - Stripe webhook list and local access rules written down
  - implementation tracker created
- Dependencies:
  - none
- Blockers:
  - none
- Exit criteria:
  - product scope is written down
  - architecture is written down
  - roadmap exists
  - tracker exists
- Notes:
  - Completed on March 2, 2026
  - Readiness for Phase 1: met

### Phase 1: Monorepo And Tooling Foundation

- Status: `[x]`
- Goal: create the repo structure and developer tooling needed for the rest of the implementation
- Deliverables:
  - workspace package manager setup
  - `apps/web` and `apps/worker`
  - `packages/core`, `packages/infrastructure`, `packages/database`, and `packages/testing`
  - TypeScript, lint, format, env, and shared workspace scripts
- Dependencies:
  - Phase 0 complete
- Blockers:
  - none
- Exit criteria:
  - repo installs cleanly
  - workspace scripts run
  - web and worker apps boot
  - typecheck passes on the empty scaffold
- Notes:
  - Completed on March 3, 2026
  - Verified with `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm build`, and a startup check through `pnpm dev`
  - Readiness for Phase 2: met

### Phase 2: Database Foundation

- Status: `[x]`
- Goal: establish the persistence model for users, articles, subscriptions, webhook inbox, and jobs
- Deliverables:
  - PostgreSQL and Prisma setup
  - initial schema and migration
  - seed strategy for local development
  - shared database package wrapper
- Dependencies:
  - Phase 1 complete
- Blockers:
  - none
- Exit criteria:
  - local database boots
  - migrations run successfully
  - seed works
  - Prisma client is accessible through the shared database package
- Notes:
  - Completed on March 3, 2026
  - Verified with `pnpm db:up`, `pnpm db:migrate`, `pnpm db:seed`, and a runtime import through `packages/database`
  - The database package entry point now targets the built shared client surface
  - Readiness for Phase 3: met

### Phase 3: Core Domain And Use Cases

- Status: `[x]`
- Goal: implement the heart of the business logic before wiring UI and Stripe details
- Deliverables:
  - `identity`, `content`, `catalog`, `subscriptions`, and `access` modules
  - entities, value objects, policies, and ports
  - initial use cases for dashboard, article reads, checkout, billing portal, webhook intake, and Stripe sync
  - domain unit tests
- Dependencies:
  - Phase 2 complete
- Blockers:
  - none
- Exit criteria:
  - access logic is testable without Next.js or Stripe
  - use cases compile against interfaces only
  - core unit tests pass
- Notes:
  - Completed on March 3, 2026
  - Verified with `pnpm --filter @stripe-access-management/core test`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`
  - Phase 3 introduced module-oriented core boundaries, pure access and subscription policies, interface-driven billing and webhook use cases, and Node-based core unit tests
  - Readiness for Phase 4: met

### Phase 4: Infrastructure Adapters

- Status: `[x]`
- Goal: connect the core to real systems without leaking external concerns into the domain
- Deliverables:
  - Prisma repositories
  - Stripe client and mappers
  - `pg-boss` queue adapter
  - auth, logging, and config adapter scaffolding
  - infrastructure integration tests where practical
- Dependencies:
  - Phase 3 complete
- Blockers:
  - none
- Exit criteria:
  - core use cases can be composed with real adapters
  - queue can publish and consume jobs
  - Stripe adapter can be called from server code
- Notes:
  - Completed on March 3, 2026
  - Verified with `pnpm --filter @stripe-access-management/infrastructure lint`, `pnpm --filter @stripe-access-management/infrastructure typecheck`, `pnpm db:up`, `pnpm db:migrate`, `pnpm --filter @stripe-access-management/infrastructure test`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`
  - Phase 4 replaced the infrastructure placeholder with runtime config, console logging, Prisma-backed repositories, a Stripe billing gateway and event normalizer, a durable `pg-boss` queue adapter, Auth.js-ready user scaffolding, and composition helpers that assemble the Phase 3 use cases with real adapters
  - Focused adapter verification now covers Prisma persistence, Stripe normalization, `pg-boss` publish and consume behavior, auth scaffolding, and infrastructure composition smoke coverage
  - Readiness for Phase 5: met

### Phase 5: Authentication And User Session Flow

- Status: `[x]`
- Goal: let users sign in with Google and establish a stable local user record
- Deliverables:
  - Auth.js configuration in `apps/web`
  - Google provider setup
  - database-backed auth persistence
  - session helpers and protected route support
  - authenticated flow tests
- Dependencies:
  - Phases 2 through 4 complete
- Blockers:
  - none
- Exit criteria:
  - a user can sign in with Google
  - a local user record exists
  - protected routes work
  - server-side session lookup is stable
- Notes:
  - Completed on March 3, 2026
  - Verified with `pnpm --filter @stripe-access-management/web lint`, `pnpm --filter @stripe-access-management/web typecheck`, `pnpm --filter @stripe-access-management/web test`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`
  - Phase 5 introduced Auth.js with Google in `apps/web`, deterministic local-user linking through the infrastructure auth scaffolding, normalized server-side session helpers, server-enforced protection for the first member routes, and focused web auth tests
  - Web auth and package imports now use workspace-safe env loading and extensionless internal imports so Next.js can build the linked source tree without leaking auth concerns across boundaries
  - Readiness for Phase 6: met

### Phase 6: Content Model And Reader Experience

- Status: `[x]`
- Goal: build the content experience before billing is fully wired so access behavior can be tested locally
- Deliverables:
  - article queries and storage
  - seeded sample articles across all three tiers
  - public landing page and pricing shell
  - dashboard and article detail pages
  - locked and unlocked article states with server-side enforcement
- Dependencies:
  - Phases 2 through 5 complete
- Blockers:
  - none
- Exit criteria:
  - signed-in users can browse content
  - locked and unlocked states render correctly
  - the full article body is protected on the server
- Notes:
  - Completed on March 3, 2026
  - Verified with `pnpm db:seed`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`
  - Phase 6 introduced deterministic seeded tier fixtures, a public landing and pricing shell, server-side dashboard and article delivery helpers in `apps/web`, protected article detail routes with locked and unlocked rendering, and focused seed and web reader tests
  - Workspace tests now run with serialized database-backed execution so shared Postgres fixtures stay deterministic across `web` and `infrastructure` package verification
  - Readiness for Phase 7: met

### Phase 7: Catalog And Stripe Product Mapping

- Status: `[x]`
- Goal: create a stable mapping between internal plans and Stripe products and prices
- Deliverables:
  - internal catalog for all six plan and interval combinations
  - Stripe product and price environment variables
  - catalog mapping and validation layer
  - Stripe dashboard setup notes
- Dependencies:
  - Phases 3 and 4 complete
- Blockers:
  - waiting for core catalog interfaces and Stripe adapter scaffolding
- Exit criteria:
  - the app can resolve any supported tier and interval to a Stripe price
  - invalid catalog configurations fail fast
- Notes:
  - Completed on March 3, 2026
  - Verified with `pnpm --filter @stripe-access-management/infrastructure lint`, `pnpm --filter @stripe-access-management/infrastructure typecheck`, `pnpm --filter @stripe-access-management/infrastructure test`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build`
  - Phase 7 introduced typed runtime loading for the six MVP Stripe catalog bindings, shared binding construction for infrastructure composition and tests, catalog setup placeholders in `.env.example`, and repository setup notes in `docs/stripe-catalog-setup.md`
  - The infrastructure catalog now fails fast on missing identifiers and duplicate price mappings, while product-only binding resolution stays intentionally non-guessing when multiple billing intervals share a Stripe product
  - Readiness for Phase 8: met

### Phase 8: Checkout And Billing Portal Flow

- Status: `[x]`
- Goal: allow users to start and manage subscriptions using Stripe-hosted flows
- Deliverables:
  - checkout route
  - customer portal route
  - auth gating for purchases
  - duplicate-subscription prevention
  - success and cancel handling
  - route-level tests
- Dependencies:
  - Phases 4, 5, and 7 complete
- Blockers:
  - waiting for auth flow, catalog mapping, and Stripe adapter integration
- Exit criteria:
  - a signed-in user can start Checkout
  - a signed-in subscribed user can open the billing portal
  - duplicate subscription creation is blocked

### Phase 9: Webhook Intake And Queueing

- Status: `[x]`
- Goal: safely receive Stripe events and queue them for background processing
- Deliverables:
  - webhook route in `apps/web`
  - signature verification
  - raw event persistence and deduplication
  - queue publish after safe persistence
  - intake tests for signature, deduplication, and enqueueing
- Dependencies:
  - Phases 2, 4, and 8 complete
- Blockers:
  - waiting for Stripe adapter, database inbox table, and queue adapter
- Exit criteria:
  - webhooks are accepted safely
  - duplicate events do not create duplicate work
  - processing is asynchronous

### Phase 10: Worker Processing And Subscription Sync

- Status: `[x]`
- Goal: turn Stripe webhook events into correct local subscription and access state
- Deliverables:
  - worker bootstrap
  - Stripe event consumer
  - idempotent processing flow
  - subscription sync use case integration
  - lifecycle tests for supported billing scenarios
- Dependencies:
  - Phases 3, 4, and 9 complete
- Blockers:
  - waiting for webhook intake, queue consumption, and sync use case wiring
- Exit criteria:
  - local subscription state stays correct across supported webhook flows
  - the same event can be retried safely
  - access rules reflect the paid-through period correctly

### Phase 11: Access Lifecycle Hardening

- Status: `[ ]`
- Goal: ensure access remains correct even when billing events are delayed, retried, or processed out of order
- Deliverables:
  - scheduled reconciliation job
  - Stripe re-fetch and drift repair flow
  - retry and visibility strategy for failed jobs
  - admin-safe diagnostics
- Dependencies:
  - Phase 10 complete
- Blockers:
  - waiting for stable worker processing and subscription projections
- Exit criteria:
  - the system has a repair path beyond webhooks alone
  - failed jobs are visible
  - subscription drift can be corrected automatically

### Phase 12: Final MVP Product Polish

- Status: `[ ]`
- Goal: make the MVP feel coherent and launch-ready
- Deliverables:
  - stronger pricing and upgrade messaging
  - improved locked-content, account, empty, error, and loading states
  - responsive and presentation polish
  - public-page metadata and SEO basics
- Dependencies:
  - Phases 6, 8, 10, and 11 complete
- Blockers:
  - waiting for stable end-to-end user flows
- Exit criteria:
  - product flows are understandable
  - major edge states have intentional UI
  - public pages are presentable

### Phase 13: Testing, QA, And Launch Preparation

- Status: `[ ]`
- Goal: verify the MVP end to end and prepare it for deployment
- Deliverables:
  - end-to-end coverage for happy paths and critical failures
  - billing lifecycle validation
  - deployment environment setup
  - production configuration and launch checklist
- Dependencies:
  - Phases 8 through 12 complete
- Blockers:
  - waiting for stable product flows and deployment targets
- Exit criteria:
  - critical flows are tested
  - staging or production deployment is ready
  - billing and access behavior is validated end to end

## Definition Of MVP Complete

The MVP is complete when all of the following are true:
- users can sign in with Google
- users can see available articles in the dashboard
- users can open articles only when they have the required active subscription tier
- Stripe Checkout sells monthly and yearly plans for Starter, Pro, and Ultra
- Stripe Customer Portal lets users manage billing
- access is extended on successful payment
- access is revoked when the paid period ends without renewal
- webhook processing is durable and idempotent
- a reconciliation job exists as a safety net
- core flows are tested and deployable
