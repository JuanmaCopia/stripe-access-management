# MVP Specification

This document captures the MVP specification for the subscription-based content app we are designing.

## Product Goal

Build a Next.js app where followers can subscribe to access paid text content such as articles.

The app must:
- Show a dashboard with available content.
- Let users click into content items.
- Allow access only if the user has the required subscription tier.
- Sell recurring subscriptions through Stripe.
- Revoke access when a paid subscription period ends and is not renewed.

## Core Product Decisions

These are the decisions already taken for the MVP.

### 1. Access model: tier-based access inside the app

We chose the simple tier-based model.

This means:
- Stripe sells membership tiers.
- The app database stores the articles.
- Each article has a required subscription tier.
- The app decides access locally using the user's active tier and subscription expiration date.

We are not using Stripe Entitlements as the runtime access check for the MVP.

### 2. Subscription tiers

The app has three subscription tiers:
- `starter`
- `pro`
- `ultra`

Tier inheritance rules:
- `starter` can access Starter content only.
- `pro` includes Starter access.
- `ultra` includes all content.

A simple rank model should be used in the app:
- `starter = 1`
- `pro = 2`
- `ultra = 3`

A user can access an article when:
- their subscription is still active, and
- their tier rank is greater than or equal to the article's required tier rank.

### 3. Billing intervals

Each subscription tier must be offered in two billing intervals:
- monthly
- yearly

This means Stripe will have 6 recurring prices in total:
- Starter monthly
- Starter yearly
- Pro monthly
- Pro yearly
- Ultra monthly
- Ultra yearly

### 4. What Stripe represents

For the MVP, Stripe products represent subscription memberships, not individual articles.

Stripe products:
- `starter`
- `pro`
- `ultra`

Articles are not Stripe products.
Articles live in the app database.

### 5. Checkout and billing management

We chose Stripe-hosted billing flows.

This means:
- Stripe Checkout will be used to start subscriptions.
- Stripe Customer Portal should be used for billing management.

We are not building a custom payment form for the MVP.

### 6. Content storage

The text content will live inside the Next.js app and database.

That means:
- Articles are created and stored by the app.
- The dashboard reads article data from the local database.
- Article access checks must also happen against local data.
- For the MVP, article creation is handled through manual seeding or manual database inserts during development.
- The MVP does not include an admin authoring UI or external CMS integration.

### 7. Access revocation behavior

The MVP must keep access aligned with the paid subscription period.

Rules:
- If a user cancels, they keep access until the end of the current paid period.
- If a renewal fails and the subscription is not successfully renewed, access ends when the current paid period ends.
- Access must not continue beyond the paid-through date.

### 8. Payment-method scope for the MVP

The webhook plan for the MVP assumes card payments only.

This includes:
- normal credit cards
- normal debit cards that are processed by Stripe as card payments

The MVP does not need delayed-payment methods such as ACH Direct Debit, SEPA Direct Debit, or Bacs Direct Debit.

## User Experience Requirements

### Dashboard

The dashboard must:
- Show available content items.
- Make it possible to click each item.
- Show whether the user can access the content.

The UI may show locked and unlocked states, but actual access enforcement must not rely only on the UI.

### Article access

When the user opens an article:
- the app must verify access on the server side
- the full content should load only if the user has the required tier and active paid access

If the user does not have access:
- the app should block the full article body
- the app should guide the user to subscribe or upgrade

## Local Access Model

The app should maintain local subscription access data.

Minimum local fields:
- `plan_tier`
- `stripe_status`
- `cancel_at_period_end`
- `access_expires_at`

The app should read these local fields when deciding whether a user can read an article.

The app should not call Stripe every time a user opens content.

## Webhook Strategy

The MVP should sync subscription state from Stripe into the app database using webhooks.

Supported MVP webhooks:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.payment_action_required`

Detailed webhook behavior is documented in:
- [mvp-stripe-webhooks.md](/home/jmcopia/workplace/stripe-access-management/.agents/context/mvp-stripe-webhooks.md)

High-level access meaning:
- Grant or extend access on `invoice.paid`.
- Sync subscription metadata on `customer.subscription.created` and `customer.subscription.updated`.
- Revoke access on `customer.subscription.deleted`.
- Do not extend access on `invoice.payment_failed` or `invoice.payment_action_required`.
- Do not use `checkout.session.completed` as the final access-grant signal.

## Suggested Domain Model

The MVP should center around these core entities:
- `User`
- `Article`
- `SubscriptionRecord`
- `PlanTier`

Suggested article fields:
- `id`
- `slug`
- `title`
- `excerpt`
- `body_markdown` or equivalent text field
- `required_tier`
- `published`

Suggested subscription fields:
- `id`
- `user_id`
- `stripe_subscription_id`
- `stripe_customer_id`
- `stripe_product_id`
- `stripe_price_id`
- `plan_tier`
- `billing_interval`
- `stripe_status`
- `cancel_at_period_end`
- `access_expires_at`
- `last_synced_at`

## Architecture Direction

The MVP should follow clean separation of concerns.

Suggested boundaries:
- `Entities`: User, Article, PlanTier, SubscriptionRecord
- `Use Cases`: ListArticles, ReadArticle, StartCheckout, OpenBillingPortal, SyncStripeSubscription
- `Adapters`: Stripe integration, database repositories, Auth integration, webhook handlers, Next.js route handlers

Important rule:
- Billing logic belongs behind a Stripe adapter.
- Access rules belong in the app's use-case layer.
- UI components should not contain the core access logic.

## Authentication

The chosen auth approach for the MVP is:
- Auth.js with Google login

Reason:
- fastest setup for the MVP
- no email delivery infrastructure required
- familiar sign-in flow for users

Important architectural rule:
- Google login is an adapter choice, not a core business rule
- the rest of the system should depend on the local user model and session abstraction, not directly on Google-specific concepts

## Explicit Non-Goals For The MVP

The MVP does not need:
- Stripe Entitlements as the runtime access checker
- custom payment forms
- an admin article editor or CMS integration
- per-article manual access rows for each user
- delayed bank-debit payment methods
- real-time calls to Stripe when loading article pages

## Summary

The MVP is a tier-based subscription content app with:
- Next.js as the application framework
- articles stored in the app database
- three subscription tiers: Starter, Pro, Ultra
- monthly and yearly billing
- Stripe-hosted Checkout and billing management
- local access control based on tier plus paid-through date
- webhook-based subscription syncing from Stripe
