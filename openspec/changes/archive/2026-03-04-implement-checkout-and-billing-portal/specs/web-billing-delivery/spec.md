## ADDED Requirements

### Requirement: Authenticated checkout initiation route
The `apps/web` application SHALL provide a `POST /api/checkout` API route that requires an active user session, accepts a plan tier and billing interval, and invokes the `StartCheckout` use case. The route MUST return a `303 See Other` redirect to the Stripe Checkout URL on success, or an appropriate error response if the use case fails or the user is unauthenticated.

#### Scenario: Successful checkout initiation
- **WHEN** an authenticated user posts a valid plan tier and interval to `/api/checkout`
- **THEN** the route SHALL return a redirect to the Stripe-hosted checkout page

#### Scenario: Unauthenticated checkout attempt
- **WHEN** an unauthenticated request is made to `/api/checkout`
- **THEN** the route SHALL return a `401 Unauthorized` status

### Requirement: Authenticated billing portal route
The `apps/web` application SHALL provide a `POST /api/portal` API route that requires an active user session and invokes the `OpenBillingPortal` use case. The route MUST return a `303 See Other` redirect to the Stripe Customer Portal URL on success, or an appropriate error response if the use case fails or the user is unauthenticated.

#### Scenario: Successful billing portal entry
- **WHEN** an authenticated user posts to `/api/portal`
- **THEN** the route SHALL return a redirect to the Stripe-hosted customer portal

### Requirement: Redirection for existing subscriptions
The `apps/web` delivery layer SHALL handle the "duplicate-subscription" outcome from the `StartCheckout` use case by redirecting the user to the billing portal instead of creating a new checkout session.

#### Scenario: Redirecting subscribed user to portal
- **WHEN** an authenticated user who already has an active subscription attempts to start a new checkout
- **THEN** the delivery layer SHALL invoke the billing portal use case and redirect the user to the customer portal
