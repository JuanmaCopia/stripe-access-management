## 1. Establish the runtime Stripe catalog binding surface

- [x] 1.1 Add typed infrastructure runtime configuration for the MVP Stripe catalog identifiers and build the six supported `StripeCatalogPlanBinding` entries from that configuration
- [x] 1.2 Reuse the shared catalog binding surface from infrastructure composition and helper utilities so supported plan selections resolve consistently across runtime and test code

## 2. Document the Stripe catalog setup contract

- [x] 2.1 Update the shared environment example with the required Stripe catalog product and price variables
- [x] 2.2 Add repository documentation for the MVP Stripe dashboard products, recurring prices, and environment variable mapping

## 3. Verify catalog loading and resolution behavior

- [x] 3.1 Add focused tests for catalog binding loading, validation failures, and supported plan resolution behavior
- [x] 3.2 Verify the workspace lint, typecheck, test, and build flows pass with the catalog binding changes in place
