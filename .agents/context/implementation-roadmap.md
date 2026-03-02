# Implementation Roadmap

This document defines the step-by-step plan from an empty repository to a finished MVP for the subscription-based content app.

It is aligned with these decisions already taken:
- Next.js app for paid text content
- manual article seeding for MVP content management
- three plans: `starter`, `pro`, `ultra`
- monthly and yearly billing
- Stripe-hosted Checkout and Customer Portal
- local access control using tier plus `access_expires_at`
- Auth.js with Google login by default
- separate background worker from day one
- durable Postgres-backed queue using `pg-boss`

Related context files:
- [mvp-specification.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/mvp-specification.md)
- [mvp-stripe-webhooks.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/mvp-stripe-webhooks.md)
- [project-architecture.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/project-architecture.md)
- [implementation-tracker.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/implementation-tracker.md)

## Delivery Strategy

We will build the MVP in layers.

The sequencing is intentional:
- foundation first
- core business model second
- user-facing product flows third
- billing and access synchronization fourth
- testing and launch hardening last

This avoids a common failure mode where billing code is written before the app has a stable domain model.

## Phase 0: Planning And Setup Baseline

Goal:
- lock scope, architecture, and implementation order before coding starts

Steps:
1. Finalize MVP scope and non-goals.
2. Finalize architecture and folder structure.
3. Finalize Stripe webhook list and local access rules.
4. Create the implementation tracker.

Exit criteria:
- product scope is written down
- architecture is written down
- roadmap exists
- tracker exists

Phase 0 implementation freeze:
- MVP content management is manual seeding only; no admin UI or CMS integration is part of the MVP
- runtime access control remains local to the app database using tier plus `access_expires_at`
- billing remains Stripe-hosted through Checkout and Customer Portal
- authentication remains Auth.js with Google as the default MVP adapter
- webhook processing remains asynchronous through a separate worker and `pg-boss`
- Phase 1 is limited to scaffolding, tooling, and workspace setup; it does not add domain rules, billing logic, or content-management features

## Phase 1: Monorepo And Tooling Foundation

Goal:
- create the repo structure and developer tooling needed for the rest of the implementation

Steps:
1. Initialize the workspace package manager setup.
2. Create the monorepo structure:
   - `apps/web`
   - `apps/worker`
   - `packages/core`
   - `packages/infrastructure`
   - `packages/database`
   - `packages/testing`
3. Set up TypeScript configs for the workspace.
4. Set up linting and formatting.
5. Set up environment-variable loading strategy.
6. Add base scripts for dev, build, test, lint, typecheck.
7. Add a shared config for path aliases and package boundaries.

Exit criteria:
- repo installs cleanly
- workspace scripts run
- web and worker apps boot
- typecheck passes on the empty scaffold

## Phase 2: Database Foundation

Goal:
- establish the persistence model for users, articles, subscriptions, webhook inbox, and jobs

Steps:
1. Set up PostgreSQL and Prisma.
2. Create the initial Prisma schema.
3. Model the core tables:
   - users
   - accounts / sessions for auth
   - articles
   - subscriptions
   - stripe webhook inbox table
   - job/queue support if needed by infrastructure
4. Add enums for:
   - `plan_tier`
   - billing interval
   - subscription status projections used locally
5. Create first migration.
6. Add a seed strategy for local development.
7. Add a database package wrapper so Prisma does not leak across the codebase.

Exit criteria:
- local database boots
- migrations run successfully
- seed works
- Prisma client is accessible through the shared database package

## Phase 3: Core Domain And Use Cases

Goal:
- implement the heart of the business logic before wiring UI and Stripe details

Steps:
1. Create domain modules in `packages/core`:
   - `identity`
   - `content`
   - `catalog`
   - `subscriptions`
   - `access`
2. Define core entities and value objects.
3. Implement the plan hierarchy policy:
   - starter < pro < ultra
4. Implement the article access policy.
5. Define repository interfaces.
6. Define external gateway interfaces:
   - billing gateway
   - queue publisher
   - auth/session abstraction if needed
7. Implement initial use cases:
   - `ListDashboardArticles`
   - `ReadArticle`
   - `StartCheckout`
   - `OpenBillingPortal`
   - `SyncStripeSubscription`
   - `RecordStripeWebhook`
8. Add unit tests for pure domain rules.

Exit criteria:
- access logic is testable without Next.js or Stripe
- use cases compile against interfaces only
- core unit tests pass

## Phase 4: Infrastructure Adapters

Goal:
- connect the core to real systems without leaking external concerns into the domain

Steps:
1. Implement Prisma repository adapters.
2. Implement the Stripe client and mapping layer.
3. Implement the `pg-boss` queue adapter.
4. Implement logging and config utilities.
5. Implement auth adapter scaffolding for Auth.js.
6. Add anti-corruption mappers from Stripe objects to internal models.
7. Add infrastructure integration tests where practical.

Exit criteria:
- core use cases can be composed with real adapters
- queue can publish and consume jobs
- Stripe adapter can be called from server code

## Phase 5: Authentication And User Session Flow

Goal:
- let users sign in with Google and establish a stable local user record

Steps:
1. Configure Auth.js in `apps/web`.
2. Add Google provider.
3. Connect Auth.js persistence to the database.
4. Ensure app users are created and linked correctly on first login.
5. Add session utilities for server-side access checks.
6. Add sign-in and sign-out UI.
7. Protect member-only areas.
8. Add tests for authenticated and unauthenticated flows.

Exit criteria:
- a user can sign in with Google
- a local user record exists
- protected routes work
- server-side session lookup is stable

## Phase 6: Content Model And Reader Experience

Goal:
- build the content experience before billing is fully wired so we can test access behavior locally

Steps:
1. Implement article storage and queries.
2. Create seeded sample articles across all three tiers.
3. Build the public landing page.
4. Build the pricing page shell.
5. Build the dashboard page showing available content.
6. Build the article detail page.
7. Show locked versus unlocked state in the UI.
8. Enforce server-side article access checks.
9. Create upgrade prompts for locked content.

Exit criteria:
- signed-in users can browse content
- locked and unlocked states render correctly
- the full article body is protected on the server

## Phase 7: Catalog And Stripe Product Mapping

Goal:
- create a stable mapping between internal plans and Stripe products/prices

Steps:
1. Define the internal catalog for:
   - starter monthly
   - starter yearly
   - pro monthly
   - pro yearly
   - ultra monthly
   - ultra yearly
2. Add environment variables for Stripe product/price IDs.
3. Build a catalog mapping layer from internal plan selection to Stripe price ID.
4. Add validation so unsupported combinations fail clearly.
5. Document required Stripe dashboard setup.

Exit criteria:
- the app can resolve any supported tier + interval to a Stripe price
- invalid catalog configurations fail fast

## Phase 8: Checkout And Billing Portal Flow

Goal:
- allow users to start and manage subscriptions using Stripe-hosted flows

Steps:
1. Build the checkout route.
2. Build the customer portal route.
3. Require authentication before subscription purchase.
4. Prevent duplicate active subscriptions.
5. Redirect already-subscribed users to manage billing instead of creating another subscription.
6. Attach Stripe customer records to local users.
7. Handle success and cancel return URLs.
8. Add tests for checkout initiation and billing portal entry.

Exit criteria:
- a signed-in user can start Checkout
- a signed-in subscribed user can open the billing portal
- duplicate subscription creation is blocked

## Phase 9: Webhook Intake And Queueing

Goal:
- safely receive Stripe events and queue them for background processing

Steps:
1. Build the webhook route in `apps/web`.
2. Verify Stripe webhook signatures.
3. Persist raw webhook events in the inbox table.
4. Deduplicate using Stripe event IDs.
5. Publish processing jobs to `pg-boss`.
6. Return `200` quickly after safe persistence and enqueueing.
7. Add tests for signature validation, deduplication, and job publish.

Supported events:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.payment_action_required`

Exit criteria:
- webhooks are accepted safely
- duplicate events do not create duplicate work
- processing is asynchronous

## Phase 10: Worker Processing And Subscription Sync

Goal:
- turn Stripe webhook events into correct local subscription and access state

Steps:
1. Build the worker bootstrap.
2. Build the Stripe event consumer.
3. Implement idempotent processing.
4. Implement event handling using the shared sync use case.
5. Update local subscription records from Stripe state.
6. Update `plan_tier`, `stripe_status`, `cancel_at_period_end`, and `access_expires_at`.
7. Ensure access is granted only on `invoice.paid`.
8. Ensure access is not extended on payment failure or action required.
9. Revoke access when the subscription is fully ended.
10. Mark inbox events as processed.
11. Add integration tests for major webhook scenarios.

Exit criteria:
- local subscription state stays correct across supported webhook flows
- the same event can be retried safely
- access rules reflect the paid-through period correctly

## Phase 11: Access Lifecycle Hardening

Goal:
- ensure access remains correct even when billing events are delayed, retried, or processed out of order

Steps:
1. Add scheduled reconciliation in the worker.
2. Re-fetch recent or suspicious subscriptions from Stripe.
3. Repair local drift when detected.
4. Add monitoring and logging for failed sync jobs.
5. Add retry policies and dead-letter handling strategy if needed.
6. Add admin-safe diagnostics for support and debugging.

Exit criteria:
- the system has a repair path beyond webhooks alone
- failed jobs are visible
- subscription drift can be corrected automatically

## Phase 12: Final MVP Product Polish

Goal:
- make the MVP feel coherent and launch-ready

Steps:
1. Improve pricing and upgrade messaging.
2. Improve locked-content states.
3. Improve account page with billing actions.
4. Add empty states and error states.
5. Add loading states.
6. Improve responsive behavior on mobile and desktop.
7. Add metadata and SEO basics for public pages.
8. Add basic analytics hooks if desired.

Exit criteria:
- product flows are understandable
- major edge states have intentional UI
- public pages are presentable

## Phase 13: Testing, QA, And Launch Preparation

Goal:
- verify the MVP end to end and prepare it for deployment

Steps:
1. Add end-to-end happy-path tests.
2. Test plan purchase for each tier.
3. Test locked vs unlocked content behavior.
4. Test cancellation at period end.
5. Test failed renewal behavior.
6. Test webhook retries and idempotency.
7. Test reconciliation job behavior.
8. Set up deployment environments.
9. Configure production environment variables.
10. Configure Stripe production webhook endpoint.
11. Prepare launch checklist.
12. Perform final smoke test in production-like environment.

Exit criteria:
- critical flows are tested
- staging or production deployment is ready
- billing and access behavior is validated end to end

## Suggested Implementation Order Within The Team

Recommended order of execution:
1. Phase 1: Monorepo and tooling
2. Phase 2: Database
3. Phase 3: Core domain and use cases
4. Phase 4: Infrastructure adapters
5. Phase 5: Authentication
6. Phase 6: Content experience
7. Phase 7: Catalog mapping
8. Phase 8: Checkout and billing portal
9. Phase 9: Webhook intake
10. Phase 10: Worker processing
11. Phase 11: Reconciliation and hardening
12. Phase 12: Product polish
13. Phase 13: QA and launch

## Definition Of MVP Complete

The MVP should be considered complete when all of the following are true:
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
