## Why

Stripe webhook delivery, while generally reliable, is not guaranteed to be instantaneous or perfectly ordered. To ensure users are not permanently locked out after a successful payment or incorrectly granted access after a cancellation, the system requires a scheduled reconciliation mechanism. This "safety net" background job will periodically check recent subscription activity against Stripe's source of truth and correct any drift in the local access state.

## What Changes

- **Scheduled Reconciliation Job**: Configure `pg-boss` in the worker to run a periodic job (e.g., hourly).
- **Subscription Drift Repair**: Implement a use case that fetches a batch of recently modified subscriptions from Stripe and compares them with local state, applying corrections via the existing sync use case.
- **Enhanced Logging**: Add specific, structured logging for drift detection and repair events to aid in administration and support.
- **Retry Configuration**: Ensure the webhook consumer is configured with appropriate automatic retries via `pg-boss` options.

## Capabilities

### New Capabilities
- `subscription-reconciliation`: A scheduled background capability to verify and correct local subscription state against the Stripe API.

### Modified Capabilities
- `worker-webhook-consumer`: Update the worker bootstrap to also register the scheduled reconciliation job and configure dead-letter logging if needed.

## Impact

- `apps/worker`: Registration of the cron job and handling of the new job type.
- `packages/core`: A new use case for fetching and reconciling subscriptions.
- `packages/infrastructure`: Additional Stripe client API calls (listing subscriptions) and queue scheduling methods.
