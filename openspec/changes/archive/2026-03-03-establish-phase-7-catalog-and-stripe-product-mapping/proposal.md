## Why

Phase 6 proved the member reading experience, but the billing side still has no production-shaped catalog source of truth. Phase 7 needs to lock the six supported `tier x billing interval` combinations to Stripe product and price identifiers now so Checkout, billing portal, and webhook work can depend on a validated catalog contract instead of test-only bindings.

## What Changes

- Add a real MVP catalog binding surface for the six supported `tier x billing interval` combinations.
- Load Stripe product and price identifiers from typed runtime configuration instead of relying on ad hoc test fixtures.
- Add clear validation and lookup helpers so unsupported or incomplete catalog configurations fail before billing flows execute.
- Document the Stripe dashboard and environment setup required to keep local and deployed catalog mappings aligned.
- Add focused tests around catalog binding loading, validation, and resolution behavior.

## Capabilities

### New Capabilities
- `stripe-catalog-bindings`: Covers the runtime-loaded catalog bindings that map the six supported internal plan selections to Stripe product and price identifiers with deterministic lookup keys and validation.
- `stripe-dashboard-catalog-setup`: Covers the documented Stripe dashboard products, recurring prices, and required environment variables needed to keep the MVP catalog configuration aligned across environments.

### Modified Capabilities

None.

## Impact

- Primarily affects `packages/infrastructure`, where Stripe catalog binding, runtime configuration, and composition helpers already live.
- Touches shared environment examples and documentation so local and deployed environments can provide the required Stripe identifiers consistently.
- Builds directly on the existing core catalog abstractions and Stripe adapter layer without changing the Phase 3 business rules.
- Unblocks Phase 8 checkout and billing portal work by replacing test-only catalog bindings with validated runtime-backed configuration.
