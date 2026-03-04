## Why

Phase 8 will bridge the core business logic and infrastructure adapters to provide a complete, user-facing subscription purchase and management flow. This is necessary to allow users to subscribe to tiers and manage their billing through Stripe-hosted Checkout and Customer Portal, enabling the core monetization model of the application.

## What Changes

- **New API Routes**: Add `POST /api/checkout` and `POST /api/portal` in `apps/web` to handle billing session initiation.
- **Authentication Gating**: Ensure billing routes are protected and operate on the current authenticated user's context.
- **Use Case Integration**: Wire the `apps/web` delivery layer to the `StartCheckout` and `OpenBillingPortal` use cases from `packages/core`.
- **Duplicate Prevention**: Implement logic to redirect already-subscribed users to the billing portal instead of allowing a new checkout session.
- **Stripe Customer Linking**: Ensure Stripe customer IDs are correctly associated with local user records during the checkout flow.
- **Redirect Handling**: Configure and handle success and cancel return URLs for Stripe-hosted flows.

## Capabilities

### New Capabilities
- `web-billing-delivery`: The Next.js routes and delivery layer for Stripe-hosted Checkout and Customer Portal interactions, ensuring authenticated access and duplicate-subscription prevention.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec file.
     Use existing spec names from openspec/specs/. Leave empty if no requirement changes. -->

## Impact

- `apps/web`: New API routes and potential UI components (e.g., "Manage Subscription" button).
- `packages/infrastructure`: Validation of composition helpers for billing use cases.
- `packages/core`: Consumption of existing use cases by the web application.
