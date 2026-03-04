## Context

Phase 9 establishes the webhook intake layer. We use `pg-boss` and the `RecordStripeWebhookUseCase` created in earlier phases. Next.js App Router API routes must handle raw body buffers to properly verify Stripe signatures.

## Goals / Non-Goals

**Goals:**
- Secure the `POST /api/webhooks/stripe` route with Stripe signature validation.
- Provide fast, synchronous 200 OK responses to Stripe.
- Reliably enqueue background jobs for worker consumption using the existing queue adapter.

**Non-Goals:**
- Processing the actual webhook payloads (e.g. updating local subscriptions). This is Phase 10.
- Managing webhook retry logic on failure (handled by Stripe initially, and then durable worker retries later).

## Decisions

### 1. Raw Body Reading in Next.js
Next.js Route Handlers require using `request.text()` to get the exact raw body string for Stripe signature verification. We will use this approach alongside the Stripe SDK's `constructEvent` method.

### 2. Immediate 200 OK Response
We delegate the actual work to the asynchronous job queue. The web layer will only save the event to the Inbox table and enqueue the `pg-boss` job, ensuring the Stripe API is not blocked by slow external systems or database locks.

## Risks / Trade-offs

- **[Risk] Missing STRIPE_WEBHOOK_SECRET**: If the secret is missing, signature verification will fail. → **Mitigation**: Fail fast during initialization and log clear configuration errors.
