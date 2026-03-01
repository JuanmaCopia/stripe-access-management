# Project Architecture

This document defines the recommended architecture for the MVP subscription content app.

It reflects the product and technical decisions already made:
- Next.js app for a paid text-content product
- Three subscription tiers: `starter`, `pro`, `ultra`
- Monthly and yearly billing
- Stripe-hosted Checkout and Customer Portal
- Local access control in the app database
- Google login as the default auth method for the MVP
- Separate background worker from day one
- Durable queue-backed webhook processing

## Architecture Decision Summary

We will build the project as a modular monolith inside a monorepo with two deployable apps:
- `web`: the Next.js application
- `worker`: the background processor

Shared business logic will live in internal packages.

This is the chosen tradeoff:
- simpler than microservices
- safer and more scalable than putting all billing and background work directly inside the Next.js runtime

## Why This Architecture

### What the user experiences

When the user:
- signs in with Google
- buys a subscription in Stripe Checkout
- opens the dashboard
- clicks an article
- cancels a subscription or misses a renewal

The system should keep access accurate without slowing down article pages.

### Why this shape fits the MVP

This architecture gives us:
- fast page loads because article access is checked locally
- safer Stripe processing because webhooks are queued and processed asynchronously
- clean business boundaries so access rules do not leak into UI code
- room to grow without forcing a rewrite later

### Alternatives considered

We are explicitly not choosing:
- a single Next.js app with no worker, because webhook and retry handling would be more fragile
- full microservices, because that would add too much infrastructure complexity for the MVP

## Architectural Style

The project should combine these patterns:
- Modular monolith
- Clean Architecture
- Ports and Adapters
- Event-driven background processing
- CQRS-lite separation between commands and queries

### What that means here

- `Domain` contains business rules and concepts.
- `Application` contains use cases.
- `Infrastructure` contains Stripe, Prisma, queue, auth, and other external integrations.
- `Web` and `Worker` are delivery layers only.

Important rule:
- business rules must not depend directly on Stripe SDK objects, Prisma models, or React components

## Deployable Apps

### 1. `web`

Responsibilities:
- render pages
- handle user sessions
- expose HTTP endpoints
- start Checkout
- open the Stripe billing portal
- receive Stripe webhooks
- enqueue background jobs

The `web` app should not contain long-running business processing.

### 2. `worker`

Responsibilities:
- process queued webhook jobs
- sync Stripe subscription state into the database
- run periodic reconciliation jobs
- run future operational jobs such as email notifications or cleanup tasks

The worker is where subscription lifecycle processing should happen.

## Queue Strategy

We will use a durable Postgres-backed queue from day one.

Recommended choice:
- `pg-boss`

Reason:
- uses PostgreSQL, which we already need
- durable and retry-friendly
- avoids bringing in Redis or a message broker for the MVP
- a better tradeoff than hand-rolling a jobs table

### Why a queue is required

Stripe webhooks should be acknowledged quickly.
The webhook endpoint should:
- verify the Stripe signature
- store the event safely
- enqueue a job
- return `200`

The worker should do the actual processing.

This protects the app from:
- timeouts
- duplicate deliveries
- out-of-order events
- temporary outages while processing

## Authentication Strategy

Default auth method for the MVP:
- Auth.js with Google login

Tradeoff:
- fastest to ship
- no email infrastructure needed
- less flexible than offering multiple login methods immediately

Architecture rule:
- the app's core should depend on a local `User` model and session abstraction
- Google is only an adapter detail in the auth layer

That means we can add other providers later without rewriting subscription or access logic.

## Core Business Modules

The system should be organized into these modules:

### `identity`

Responsibilities:
- user identity
- auth-linked account data
- session-related application logic

### `content`

Responsibilities:
- articles
- article listing
- article reading
- published/unpublished rules

### `catalog`

Responsibilities:
- subscription tier definitions
- plan ranking rules
- Stripe price mapping

### `subscriptions`

Responsibilities:
- local subscription record
- Stripe lifecycle synchronization
- billing status tracking
- paid-through period tracking

### `access`

Responsibilities:
- article access decisions
- tier comparison
- active-period checks

Important rule:
- Stripe is not a domain module
- Stripe belongs in infrastructure and is accessed through ports/adapters

## Folder Structure

```text
/
  apps/
    web/
      app/
        (public)/
          page.tsx
          pricing/
            page.tsx
        (member)/
          dashboard/
            page.tsx
          articles/
            [slug]/
              page.tsx
          account/
            page.tsx
        api/
          auth/
            [...nextauth]/
              route.ts
          stripe/
            checkout/
              route.ts
            billing-portal/
              route.ts
            webhook/
              route.ts
      src/
        presenters/
        server/
          composition/
          guards/
          session/
          view-models/
        ui/
      package.json

    worker/
      src/
        bootstrap/
          container.ts
        consumers/
          stripe/
            process-stripe-event.ts
        schedulers/
          reconcile-subscriptions.ts
        main.ts
      package.json

  packages/
    core/
      src/
        modules/
          access/
            application/
            domain/
          catalog/
            application/
            domain/
          content/
            application/
            domain/
          identity/
            application/
            domain/
          subscriptions/
            application/
            domain/
        shared/
          kernel/
            errors/
            ids/
            result/
            time/
            types/
      package.json

    infrastructure/
      src/
        auth/
          authjs/
        database/
          repositories/
        logging/
        queue/
        stripe/
          client/
          handlers/
          mappers/
      package.json

    database/
      prisma/
        migrations/
        schema.prisma
        seed.ts
      src/
        client.ts
      package.json

    testing/
      src/
        factories/
        fakes/
        stripe/
      package.json

  docs/
  scripts/
  package.json
  pnpm-workspace.yaml
```

## Layer Responsibilities

### Domain layer

This layer defines:
- entities
- value objects
- domain policies
- pure business rules

Examples:
- `PlanTier`
- `Article`
- `SubscriptionRecord`
- `AccessPolicy`

The domain layer must be framework-agnostic.

### Application layer

This layer defines use cases.

Examples:
- `ListDashboardArticles`
- `ReadArticle`
- `StartCheckout`
- `OpenBillingPortal`
- `SyncStripeSubscription`
- `RecordStripeWebhook`

The application layer may depend on repository and gateway interfaces, but not concrete SDKs.

### Infrastructure layer

This layer implements adapters for external systems.

Examples:
- Prisma repositories
- Stripe billing gateway
- Auth.js adapter
- `pg-boss` queue adapter
- logging implementation

### Delivery layer

This layer includes:
- Next.js pages and route handlers
- worker consumers
- scheduler entrypoints

This layer should be thin.
It should call use cases rather than contain business rules.

## Dependency Rules

These rules should be enforced in code review.

Allowed direction:
- `web` -> `core`
- `worker` -> `core`
- `web` -> `infrastructure`
- `worker` -> `infrastructure`
- `infrastructure` -> `core`

Not allowed:
- `core` -> `web`
- `core` -> `worker`
- `core` -> `infrastructure` implementation details
- React components importing Prisma directly
- route handlers containing access rules or Stripe lifecycle rules

## Design Patterns To Use

### 1. Use Case / Interactor Pattern

Every business action should have a named use case.

Examples:
- `StartCheckout`
- `ReadArticle`
- `SyncStripeSubscription`

Reason:
- keeps behavior explicit
- makes testing easier
- prevents business logic from spreading across route handlers

### 2. Repository Pattern

Use repositories for persistence access.

Examples:
- `UserRepository`
- `ArticleRepository`
- `SubscriptionRepository`
- `StripeWebhookEventRepository`

Reason:
- keeps Prisma out of the core
- makes core logic easier to test

### 3. Policy Pattern

Use explicit policies for important rules.

Examples:
- `AccessPolicy.canReadArticle(...)`
- `PlanHierarchy.includes(...)`

Reason:
- centralizes the most critical rules
- avoids duplicated tier logic across the app

### 4. Adapter Pattern

Wrap all external systems behind adapters.

Examples:
- `StripeBillingGateway`
- `GoogleAuthAdapter`
- `QueuePublisher`

Reason:
- protects the core from SDK-specific details
- keeps replacement cost lower later

### 5. Anti-Corruption Layer

Map external objects to internal models.

Examples:
- Stripe subscription object -> `SubscriptionRecord`
- Stripe price ID -> internal plan tier and interval

Reason:
- Stripe's model should not become the app's internal language

### 6. Inbox Pattern For Webhooks

Store incoming Stripe events before processing them.

Recommended table purpose:
- raw event storage
- duplicate detection using Stripe event ID
- processing status tracking

Reason:
- Stripe retries failed deliveries
- events may arrive more than once
- events are not guaranteed to arrive in order

### 7. Idempotent Consumer Pattern

Webhook processing must be safe to run more than once.

Reason:
- the same Stripe event can be delivered multiple times
- a worker crash can cause retries

Visible outcome:
- the user's access state stays correct even when the same event is processed again

### 8. Scheduled Reconciliation Pattern

Run a periodic job that re-checks subscription state against Stripe for recent or suspicious records.

Reason:
- gives the system a safety net if a webhook is delayed, missed, or processed incorrectly

## Patterns To Avoid

We should avoid these patterns for the MVP:
- full microservices
- event sourcing
- separate read database for CQRS
- direct Stripe API checks during article reads
- direct Prisma usage inside React components
- putting business rules in route handlers
- manually granting article access row-by-row for each user
- introducing Redis only to support a queue

## Request and Event Flows

### Dashboard flow

When the user opens the dashboard:
1. the `web` app resolves the session
2. the `content` query loads published articles
3. the `access` module computes whether each article is locked or unlocked
4. the UI renders the list

### Article read flow

When the user opens an article:
1. the `web` app resolves the session
2. the `ReadArticle` use case loads the article
3. the `AccessPolicy` checks the user's local access state
4. the full content is returned only if access is allowed

### Checkout flow

When the user starts a subscription:
1. the `web` app validates the selected tier and interval
2. the `StartCheckout` use case resolves the internal catalog mapping
3. the Stripe adapter creates the Checkout session
4. the user is redirected to Stripe-hosted Checkout

### Webhook flow

When Stripe sends a webhook:
1. the `web` app verifies the signature
2. the raw event is stored in the webhook inbox table
3. the event is published to the queue
4. the `web` app returns `200`
5. the `worker` consumes the job
6. the `SyncStripeSubscription` use case updates local subscription and access state
7. the event is marked processed

### Reconciliation flow

On a schedule:
1. the `worker` loads recent subscriptions that need verification
2. the Stripe adapter fetches fresh billing state
3. the use case recomputes local access fields
4. differences are repaired in the database

## Data Ownership

The system should treat data ownership like this:

- Stripe owns payment processing and remote billing status
- The app database owns article content
- The app database owns runtime access checks
- The app database owns the local projection of subscription state used for authorization

Important rule:
- article page requests should never depend on live calls to Stripe

## Suggested Core Interfaces

Examples of interfaces the core should define:
- `UserRepository`
- `ArticleRepository`
- `SubscriptionRepository`
- `StripeWebhookInboxRepository`
- `BillingGateway`
- `QueuePublisher`
- `Clock`

Reason:
- keeps the application layer testable and deterministic

## Testing Strategy

The project should test at three levels:

### Domain tests

Test pure business rules such as:
- tier inheritance
- access checks
- expiration behavior

### Application tests

Test use cases with fakes such as:
- reading an article with and without access
- starting Checkout with valid and invalid inputs
- syncing a Stripe subscription into local state

### Integration tests

Test infrastructure boundaries such as:
- Prisma repositories
- Stripe webhook signature handling
- queue publish/consume flow
- webhook-to-access update flow

## Operational Notes

### Webhook handling rules

Webhook endpoints must:
- verify signatures
- be idempotent
- respond quickly
- avoid doing heavy processing inline

### Access enforcement rules

The UI may show locked/unlocked states, but server-side access checks are the real gate.

### Subscription model rule

One user should have one effective active subscription at a time for the MVP.

This avoids:
- overlapping subscriptions
- ambiguous access state
- confusing billing behavior

## Summary

The project architecture for the MVP is:
- monorepo
- modular monolith
- separate `web` and `worker` apps
- shared `core`, `infrastructure`, and `database` packages
- clean architecture boundaries
- durable Postgres-backed queue using `pg-boss`
- Auth.js with Google login
- Stripe integration isolated behind adapters
- local access control based on tier and `access_expires_at`
