## 1. Worker Bootstrap Setup

- [x] 1.1 Implement graceful startup and shutdown in `apps/worker/src/main.ts`.
- [x] 1.2 Initialize infrastructure composition inside the worker to provide database and use case access.

## 2. Event Consumption & Sync

- [x] 2.1 Set up the `pg-boss` queue adapter to consume Stripe webhook jobs.
- [x] 2.2 For each job, retrieve the `NormalizedStripeEvent` from the webhook inbox repository.
- [x] 2.3 Invoke the `SyncStripeSubscriptionUseCase` with the event to update local subscription and access state.
- [x] 2.4 Acknowledge the job completion in `pg-boss` upon success.

## 3. Testing & Verification

- [x] 3.1 Write integration tests in `apps/worker/src/test/worker.test.ts` to verify worker startup and job handling.
- [x] 3.2 Verify that the worker properly projects `invoice.paid` events into extended `access_expires_at` periods.
- [x] 3.3 Verify that the worker handles idempotent retries correctly without drifting access state.
