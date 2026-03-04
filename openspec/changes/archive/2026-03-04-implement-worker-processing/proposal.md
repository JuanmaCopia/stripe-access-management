## Why

Phase 10 is necessary to convert the asynchronously queued Stripe webhook events into actual local state updates. While the web application safely intakes these events (Phase 9), the background worker must process them idempotently to keep the local `subscriptions` table and the `users` access state synchronized with the billing truth from Stripe. This separates the slow, critical domain processing from the fast web request lifecycle.

## What Changes

- **Worker Bootstrap**: Implement the main entry point for `apps/worker` to start the application and connect to the database.
- **Queue Consumer**: Configure `pg-boss` in the worker to consume webhook processing jobs.
- **Event Handling**: Invoke the `SyncStripeSubscriptionUseCase` for each consumed webhook job.
- **Idempotency**: Ensure that reprocessing an event is safe and doesn't incorrectly extend or revoke access if already processed.
- **Inbox Cleanup**: Mark events as processed or remove them from the inbox after successful handling.

## Capabilities

### New Capabilities
- `worker-webhook-consumer`: The background process responsible for consuming webhook jobs and synchronizing local subscription state from Stripe events.

### Modified Capabilities
- `subscription-billing-orchestration`: No requirement changes; the worker will consume the existing `SyncStripeSubscriptionUseCase`.

## Impact

- `apps/worker`: New bootstrap and job consumer logic.
- `packages/infrastructure`: Usage of the queue adapter consumer API and database composition.
- `packages/core`: `SyncStripeSubscriptionUseCase` will now be executed in the production worker environment.
