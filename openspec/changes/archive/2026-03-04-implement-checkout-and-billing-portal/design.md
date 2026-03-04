## Context

Phase 8 focuses on the delivery layer implementation within `apps/web`. The core business logic (`packages/core`) and infrastructure adapters (`packages/infrastructure`) for Stripe-hosted billing are already established but need to be wired into Next.js API routes. Authentication is managed via Auth.js, and the application requires a secure, authenticated bridge to Stripe's hosted Checkout and Customer Portal flows.

## Goals / Non-Goals

**Goals:**
- Implement secure Next.js Route Handlers for initiating billing sessions (`POST /api/checkout` and `POST /api/portal`).
- Wire the web delivery layer to the `StartCheckoutUseCase` and `OpenBillingPortalUseCase` using the infrastructure composition.
- Handle use case outcomes (success, duplicate, failure) with appropriate HTTP redirects or error responses.
- Enforce authenticated-only access for all billing-related routes.
- Prevent duplicate active subscriptions by redirecting users to the Customer Portal if they attempt a redundant purchase.

**Non-Goals:**
- Implementation of the Stripe webhook listener (reserved for Phase 9).
- Background processing of billing events (reserved for Phase 10).
- Advanced pricing UI or dashboard management (reserved for Phase 12).
- Handling of multiple concurrent subscriptions for a single user (MVP assumes one effective subscription).

## Decisions

### 1. API Route Handlers for Billing Sessions
We will use Next.js App Router `Route Handlers` located in `apps/web/app/api/checkout/route.ts` and `apps/web/app/api/portal/route.ts`. This ensures a clear separation between the UI components and the billing orchestration logic.

### 2. Request-Time Use Case Composition
Use cases will be instantiated within the route handlers using the `createInfrastructureComposition` helper. This ensures all domain dependencies (repositories, gateways, catalog) are correctly injected at runtime based on the current environment configuration.

### 3. Graceful Duplicate Redirection
When the `StartCheckoutUseCase` returns a `duplicate_subscription` status, the delivery layer will not treat this as a failure. Instead, it will immediately invoke the `OpenBillingPortalUseCase` and redirect the user to Stripe's Customer Portal, providing a seamless "manage instead of buy" experience.

### 4. Shared Success and Cancel Handling
Success and cancel URLs for Stripe Checkout will be standardized and passed from the route handlers to the core use cases. These will point back to the member dashboard and account pages in `apps/web`.

## Risks / Trade-offs

- **[Risk] Configuration Drift**: If Stripe price IDs or portal configuration IDs in the environment do not match the Stripe dashboard, sessions will fail to create. → **Mitigation**: Use the catalog validation from Phase 7 to fail fast during composition and log clear infrastructure errors.
- **[Risk] Missing Customer IDs**: If a user attempts to open the portal but has no Stripe customer ID (e.g., they haven't bought anything yet). → **Mitigation**: The `OpenBillingPortalUseCase` and gateway correctly handle this, and the UI should only show the "Manage Billing" button to users with active subscriptions or a known customer ID.
