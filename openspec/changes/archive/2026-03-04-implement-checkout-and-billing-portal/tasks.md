## 1. Web API Routes Implementation

- [x] 1.1 Create `apps/web/app/api/checkout/route.ts` with authentication gating.
- [x] 1.2 Implement POST handler for checkout that invokes `StartCheckoutUseCase` and handles the result.
- [x] 1.3 Implement duplicate-subscription redirection to the billing portal within the checkout route.
- [x] 1.4 Create `apps/web/app/api/portal/route.ts` with authentication gating.
- [x] 1.5 Implement POST handler for billing portal that invokes `OpenBillingPortalUseCase`.

## 2. Infrastructure & Composition Support

- [x] 2.1 Ensure `createInfrastructureComposition` provides the required billing use cases to the web application.
- [x] 2.2 Verify that the Stripe client correctly handles `SUCCESS_URL` and `CANCEL_URL` from the delivery layer.

## 3. UI Integration

- [x] 3.1 Update the pricing section in `apps/web/app/page.tsx` to include forms for initiating checkout.
- [x] 3.2 Update the member account page in `apps/web/app/(member)/account/page.tsx` to include a "Manage billing" button.

## 4. Verification & Testing

- [x] 4.1 Add route-level integration tests in `apps/web/src/test/billing-routes.test.ts` for `/api/checkout`.
- [x] 4.2 Add route-level integration tests in `apps/web/src/test/billing-routes.test.ts` for `/api/portal`.
- [x] 4.3 Verify the end-to-end redirection flow (unauthenticated, authenticated, and duplicate cases).
