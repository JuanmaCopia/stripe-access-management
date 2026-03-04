## ADDED Requirements

### Requirement: Webhook signature verification
The `apps/web` application SHALL provide a `POST /api/webhooks/stripe` API route that validates incoming requests against the configured Stripe webhook secret using the Stripe SDK.

#### Scenario: Invalid signature rejection
- **WHEN** the route receives a request with a missing or invalid Stripe signature header
- **THEN** it SHALL return an error response without persisting the event

### Requirement: Fast synchronous acknowledgment
The webhook route SHALL read the raw payload, invoke the `RecordStripeWebhookUseCase` to durably store the event and emit a processing intent, and immediately return a `200 OK` status without attempting to process the domain billing consequences synchronously.

#### Scenario: Successful event intake
- **WHEN** the route receives a valid Stripe webhook event
- **THEN** it SHALL record the event via the use case and return a 200 status, completing the HTTP request quickly
