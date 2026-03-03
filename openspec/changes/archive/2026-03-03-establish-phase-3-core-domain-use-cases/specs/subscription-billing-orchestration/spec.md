## ADDED Requirements

### Requirement: Billing session initiation use cases must resolve internal plans through ports
The core application SHALL provide `StartCheckout` and `OpenBillingPortal` use cases that operate on authenticated local users, resolve internal plan selections through the catalog model, and depend on billing gateway ports rather than concrete Stripe SDK calls. The checkout flow MUST reject unsupported plan selections and MUST be able to prevent duplicate active subscription starts from the local subscription view.

#### Scenario: Starting checkout for an already-active plan
- **WHEN** an authenticated user already has active local access for the selected tier and billing interval
- **THEN** the checkout use case SHALL return a duplicate-subscription outcome instead of requesting a new billing session

### Requirement: Stripe webhook intake must be modeled as durable asynchronous work
The core application SHALL provide a `RecordStripeWebhook` use case that records the normalized Stripe event envelope through persistence ports and emits a queueable processing intent without depending on HTTP transport details or worker runtime implementation.

#### Scenario: Recording a Stripe webhook event
- **WHEN** the application receives a Stripe event that passes delivery-layer verification
- **THEN** the use case SHALL persist the event as a durable inbox record and return the information needed to enqueue asynchronous processing

### Requirement: Subscription synchronization must project local access from billing truth rules
The core application SHALL provide a `SyncStripeSubscription` use case that updates the local subscription projection and access state from normalized billing events according to the MVP rules: `invoice.paid` grants or extends access, `checkout.session.completed` does not grant access on its own, `invoice.payment_failed` and `invoice.payment_action_required` do not extend access, and `customer.subscription.deleted` revokes access when the subscription fully ends.

#### Scenario: Extending access after successful payment
- **WHEN** the synchronization use case processes a normalized `invoice.paid` event with a later paid-through period end
- **THEN** the local subscription projection SHALL keep the user's plan metadata in sync and extend `access_expires_at` to the paid-through end of the successfully paid period
