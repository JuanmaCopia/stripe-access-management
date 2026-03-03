## 1. Establish the core package structure

- [x] 1.1 Replace the `packages/core` placeholder with the shared kernel and module-oriented folder structure for `identity`, `content`, `catalog`, `subscriptions`, and `access`
- [x] 1.2 Add the core exports, neutral DTOs, and foundational helpers needed for module-to-module use without infrastructure imports

## 2. Implement the pure domain model and ports

- [x] 2.1 Implement the catalog, subscription, and access value objects and policies, including the Starter < Pro < Ultra hierarchy
- [x] 2.2 Define the core entities and repository or gateway ports required by dashboard, article, billing, webhook, and sync use cases
- [x] 2.3 Define normalized billing-event and queue-intent contracts that keep Stripe and worker runtime details out of `packages/core`

## 3. Implement the Phase 3 use cases

- [x] 3.1 Implement `ListDashboardArticles` and `ReadArticle` against the content and access policies
- [x] 3.2 Implement `StartCheckout` and `OpenBillingPortal` against catalog, subscription, identity, and billing gateway ports
- [x] 3.3 Implement `RecordStripeWebhook` and `SyncStripeSubscription` against persistence, queue, clock, and billing-event contracts

## 4. Lock behavior with unit tests and verification

- [x] 4.1 Add unit tests for plan ordering, paid-through expiration, and locked or unlocked article access decisions
- [x] 4.2 Add use-case tests with fake ports for dashboard listing, article reads, duplicate checkout prevention, webhook recording, and `invoice.paid` access extension
- [x] 4.3 Verify `packages/core` exports compile cleanly and the workspace typecheck and test commands pass with the new core implementation
