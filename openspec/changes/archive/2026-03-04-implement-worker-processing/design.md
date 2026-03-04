## Context

Phase 10 enables the background processing of Stripe webhooks. The `apps/worker` project was scaffolded in Phase 1 but is currently empty. We must implement a robust consumer loop using the existing `pg-boss` queue adapter and the Phase 3 domain use cases.

## Goals / Non-Goals

**Goals:**
- Implement a graceful startup and shutdown sequence for `apps/worker`.
- Use the `PgBossQueueAdapter` to subscribe to the webhook job queue.
- Process jobs using the `SyncStripeSubscriptionUseCase` to project Stripe state into local access state.
- Ensure the worker handles database connection errors gracefully and retries jobs if processing fails.

**Non-Goals:**
- Handling delayed drift repair (scheduled reconciliation) - this is reserved for Phase 11.
- Sophisticated dead-letter queues beyond the `pg-boss` defaults.

## Decisions

### 1. Worker Execution Model
The worker will run as a long-lived Node.js process. We will implement `apps/worker/src/main.ts` with a `startWorker` function that loops or subscribes via the `pg-boss` API.

### 2. Infrastructure Composition Reuse
The worker will utilize the same `createInfrastructureCompositionFromEnv` helper as the web application to ensure consistent adapter behavior and database connections.

### 3. Graceful Shutdown
The worker must trap `SIGINT` and `SIGTERM` to allow currently executing jobs to finish and close the database connection cleanly.

## Risks / Trade-offs

- **[Risk] Out-of-order events**: Stripe webhooks might arrive out of order (e.g., `customer.subscription.updated` before `customer.subscription.created`). → **Mitigation**: The `SyncStripeSubscriptionUseCase` is designed to upsert based on Stripe IDs, ensuring eventual consistency regardless of strict ordering.
