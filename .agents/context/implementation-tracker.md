# Implementation Tracker

This file tracks progress toward the MVP.

Last updated: March 1, 2026

Status legend:
- `[ ]` Not started
- `[-]` In progress
- `[x]` Done
- `[!]` Blocked

Related context files:
- [implementation-roadmap.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/implementation-roadmap.md)
- [mvp-specification.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/mvp-specification.md)
- [mvp-stripe-webhooks.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/mvp-stripe-webhooks.md)
- [project-architecture.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/project-architecture.md)

## Current State Summary

Current implementation state:
- planning and architecture documentation exists
- application code has not been scaffolded yet
- no database schema has been implemented yet
- no Stripe integration has been implemented yet
- no auth flow has been implemented yet
- no worker or queue has been implemented yet

Current focus recommendation:
- start with repo scaffolding, workspace setup, and database foundation

## Milestone Overview

| Milestone | Status | Notes |
| --- | --- | --- |
| Planning and scope definition | `[x]` | MVP, webhook, and architecture docs are in place |
| Monorepo and tooling foundation | `[ ]` | Not started |
| Database foundation | `[ ]` | Not started |
| Core domain and use cases | `[ ]` | Not started |
| Infrastructure adapters | `[ ]` | Not started |
| Authentication | `[ ]` | Not started |
| Content experience | `[ ]` | Not started |
| Catalog and Stripe mapping | `[ ]` | Not started |
| Checkout and billing portal | `[ ]` | Not started |
| Webhook intake and queueing | `[ ]` | Not started |
| Worker processing and sync | `[ ]` | Not started |
| Access lifecycle hardening | `[ ]` | Not started |
| Product polish | `[ ]` | Not started |
| QA and launch prep | `[ ]` | Not started |

## Phase 0: Planning And Setup Baseline

- [x] MVP specification documented
- [x] Stripe webhook strategy documented
- [x] Project architecture documented
- [x] Implementation roadmap documented
- [x] Implementation tracker created

Notes:
- product scope is aligned around a tier-based content app
- Google login is the chosen default auth method for the MVP
- queue-backed webhook processing with `pg-boss` is the chosen background-processing approach

## Phase 1: Monorepo And Tooling Foundation

- [ ] Initialize workspace package manager configuration
- [ ] Create `apps/web`
- [ ] Create `apps/worker`
- [ ] Create `packages/core`
- [ ] Create `packages/infrastructure`
- [ ] Create `packages/database`
- [ ] Create `packages/testing`
- [ ] Set up TypeScript workspace configuration
- [ ] Set up linting
- [ ] Set up formatting
- [ ] Set up environment variable strategy
- [ ] Add shared scripts for dev/build/test/typecheck

## Phase 2: Database Foundation

- [ ] Set up PostgreSQL
- [ ] Set up Prisma
- [ ] Model users
- [ ] Model auth persistence tables
- [ ] Model articles
- [ ] Model subscriptions
- [ ] Model Stripe webhook inbox table
- [ ] Create initial migration
- [ ] Add seed strategy
- [ ] Wrap Prisma in shared database package

## Phase 3: Core Domain And Use Cases

- [ ] Create `identity` module
- [ ] Create `content` module
- [ ] Create `catalog` module
- [ ] Create `subscriptions` module
- [ ] Create `access` module
- [ ] Implement plan hierarchy policy
- [ ] Implement article access policy
- [ ] Define repository interfaces
- [ ] Define billing gateway interface
- [ ] Define queue publisher interface
- [ ] Implement `ListDashboardArticles`
- [ ] Implement `ReadArticle`
- [ ] Implement `StartCheckout`
- [ ] Implement `OpenBillingPortal`
- [ ] Implement `SyncStripeSubscription`
- [ ] Implement `RecordStripeWebhook`
- [ ] Add core unit tests

## Phase 4: Infrastructure Adapters

- [ ] Implement Prisma repositories
- [ ] Implement Stripe client wrapper
- [ ] Implement Stripe mappers
- [ ] Implement queue adapter with `pg-boss`
- [ ] Implement logging utilities
- [ ] Implement config utilities
- [ ] Implement Auth.js adapter support
- [ ] Add infrastructure integration tests

## Phase 5: Authentication

- [ ] Configure Auth.js in `apps/web`
- [ ] Add Google provider
- [ ] Connect auth persistence to database
- [ ] Create local user on first login
- [ ] Add server-side session helpers
- [ ] Add sign-in page/UI
- [ ] Add sign-out flow
- [ ] Protect member routes
- [ ] Test auth flows

## Phase 6: Content Experience

- [ ] Implement article repository and queries
- [ ] Seed sample articles for all tiers
- [ ] Build public landing page
- [ ] Build pricing page shell
- [ ] Build member dashboard page
- [ ] Build article detail page
- [ ] Show locked/unlocked states
- [ ] Enforce server-side article access
- [ ] Add upgrade prompts for locked content

## Phase 7: Catalog And Stripe Mapping

- [ ] Define internal catalog for all 6 plan/interval combinations
- [ ] Add Stripe product and price environment variables
- [ ] Map tier + interval to Stripe price IDs
- [ ] Validate catalog configuration at startup
- [ ] Document required Stripe dashboard setup

## Phase 8: Checkout And Billing Portal

- [ ] Build checkout route
- [ ] Require authentication before checkout
- [ ] Create Stripe Checkout session
- [ ] Attach Stripe customer to local user
- [ ] Prevent duplicate active subscriptions
- [ ] Redirect existing subscribers to billing portal when appropriate
- [ ] Build billing portal route
- [ ] Handle success/cancel return states
- [ ] Test checkout and portal entry flows

## Phase 9: Webhook Intake And Queueing

- [ ] Build webhook endpoint
- [ ] Verify Stripe webhook signatures
- [ ] Persist raw Stripe events
- [ ] Deduplicate by Stripe event ID
- [ ] Publish jobs to queue
- [ ] Return `200` quickly after safe persistence
- [ ] Test webhook intake behavior

Supported events for this phase:
- [ ] `checkout.session.completed`
- [ ] `customer.subscription.created`
- [ ] `customer.subscription.updated`
- [ ] `customer.subscription.deleted`
- [ ] `invoice.paid`
- [ ] `invoice.payment_failed`
- [ ] `invoice.payment_action_required`

## Phase 10: Worker Processing And Subscription Sync

- [ ] Bootstrap worker app
- [ ] Consume Stripe event jobs
- [ ] Implement idempotent processing
- [ ] Sync subscription changes into local DB
- [ ] Update `plan_tier`
- [ ] Update `stripe_status`
- [ ] Update `cancel_at_period_end`
- [ ] Update `access_expires_at`
- [ ] Grant/extend access on `invoice.paid`
- [ ] Avoid extending access on `invoice.payment_failed`
- [ ] Avoid extending access on `invoice.payment_action_required`
- [ ] Revoke access on `customer.subscription.deleted`
- [ ] Mark events as processed
- [ ] Test major billing lifecycle scenarios

## Phase 11: Access Lifecycle Hardening

- [ ] Add scheduled reconciliation job
- [ ] Re-fetch recent subscriptions from Stripe
- [ ] Repair local state drift
- [ ] Add retry policy for failed jobs
- [ ] Add observability/logging for failures
- [ ] Add operational diagnostics for support

## Phase 12: Product Polish

- [ ] Improve pricing page copy and layout
- [ ] Improve upgrade messaging
- [ ] Improve locked-state UX
- [ ] Improve account page billing actions
- [ ] Add empty states
- [ ] Add error states
- [ ] Add loading states
- [ ] Improve mobile responsiveness
- [ ] Improve desktop responsiveness
- [ ] Add public-page SEO basics

## Phase 13: QA And Launch Preparation

- [ ] Add end-to-end happy-path tests
- [ ] Test Starter purchase flow
- [ ] Test Pro purchase flow
- [ ] Test Ultra purchase flow
- [ ] Test article locking and unlocking
- [ ] Test cancellation at period end
- [ ] Test failed renewal behavior
- [ ] Test webhook retries and idempotency
- [ ] Test reconciliation job
- [ ] Set up deployment environments
- [ ] Configure production environment variables
- [ ] Configure production Stripe webhook endpoint
- [ ] Run final smoke tests
- [ ] Prepare MVP launch checklist

## Risks To Watch

- [ ] Stripe-to-local state drift
- [ ] duplicate subscriptions for one user
- [ ] webhook processing order issues
- [ ] missing server-side access enforcement
- [ ] plan/price mapping mistakes between app and Stripe
- [ ] auth/account linking issues for returning users

## Definition Of MVP Complete

The MVP is complete when all of the following are true:
- [ ] users can sign in with Google
- [ ] users can see available articles in the dashboard
- [ ] users can read only the articles their tier allows
- [ ] Starter, Pro, and Ultra all support monthly and yearly billing
- [ ] Stripe Checkout works end to end
- [ ] Stripe Customer Portal works end to end
- [ ] successful payments extend access
- [ ] canceled or unrenewed subscriptions lose access at the correct time
- [ ] webhook processing is durable and idempotent
- [ ] reconciliation exists as a safety net
- [ ] critical flows are tested
- [ ] the app is deployable
