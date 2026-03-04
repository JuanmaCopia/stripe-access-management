## Why

Phase 9 implements the webhook intake delivery layer for receiving billing lifecycle events from Stripe. To ensure durability and fast response times, the application must safely accept incoming events, verify their signatures, persist them to an inbox table, and queue them for asynchronous processing without doing the actual domain updates in the same synchronous request.

## What Changes

- **New Webhook API Route**: Add `POST /api/webhooks/stripe` in `apps/web`.
- **Signature Verification**: Ensure the route verifies the Stripe webhook signature using the configured webhook secret before parsing or processing.
- **Event Persistence & Deduplication**: Use the existing `RecordStripeWebhookUseCase` to persist the raw event payload in the database.
- **Job Enqueueing**: Publish a background job via the `pg-boss` queue adapter for later processing.
- **Fast Acknowledgment**: Return a `200 OK` status immediately after persistence and enqueueing.

## Capabilities

### New Capabilities
- `web-webhook-delivery`: The delivery layer for receiving, verifying, and persisting Stripe webhook events securely within `apps/web`.

### Modified Capabilities
- `subscription-billing-orchestration`: No requirement changes; the delivery layer will simply consume the existing `RecordStripeWebhookUseCase` as specified.

## Impact

- `apps/web`: New API route handling raw request bodies for signature verification.
- `packages/infrastructure`: Validation of `STRIPE_WEBHOOK_SECRET` configuration and usage of the webhook repository and queue publisher.
- `packages/core`: `RecordStripeWebhookUseCase` will be actively used by the Next.js delivery layer.
