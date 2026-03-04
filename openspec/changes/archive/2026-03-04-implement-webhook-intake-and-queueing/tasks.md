## 1. Webhook Route Setup

- [x] 1.1 Create `apps/web/app/api/webhooks/stripe/route.ts`.
- [x] 1.2 Implement POST handler that reads the raw request text.
- [x] 1.3 Add Stripe signature verification using the Stripe SDK and `STRIPE_WEBHOOK_SECRET`.

## 2. Integration with Core Use Cases

- [x] 2.1 Retrieve the `RecordStripeWebhookUseCase` from the infrastructure composition.
- [x] 2.2 Call the use case with the verified event payload to persist it to the inbox.
- [x] 2.3 Return a 200 OK response upon successful persistence and enqueueing.

## 3. Testing

- [x] 3.1 Add route-level integration tests in `apps/web/src/test/webhook-routes.test.ts`.
- [x] 3.2 Verify that invalid signatures return an error response.
- [x] 3.3 Verify that valid signatures trigger the use case correctly.
