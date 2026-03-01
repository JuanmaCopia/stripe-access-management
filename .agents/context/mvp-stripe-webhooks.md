# Stripe MVP Webhooks

This document lists the Stripe webhooks the app should support for the MVP subscription flow.

Scope assumptions:
- Stripe Checkout is hosted by Stripe.
- The app sells recurring subscriptions only.
- The MVP accepts card payments only.
- Access to articles is controlled locally in the app database.
- The app stores these local subscription fields:
  - `plan_tier`
  - `stripe_status`
  - `cancel_at_period_end`
  - `access_expires_at`

## Recommended MVP Webhooks

### 1. `checkout.session.completed`

Stripe sends this when the customer successfully completes the hosted Checkout flow.

Use it to:
- Link the Stripe Checkout session to the signed-in app user.
- Store the Stripe customer ID if needed.
- Record that the checkout flow completed.

Access meaning:
- Do not grant access from this event alone.
- This means the customer finished Checkout, not necessarily that access should be extended.
- The main access-grant event should still be `invoice.paid`.

### 2. `customer.subscription.created`

Stripe sends this when the subscription object is first created.

Use it to:
- Create the local subscription record.
- Store the Stripe subscription ID, customer ID, plan tier, interval, and initial Stripe status.

Access meaning:
- Do not rely on this event alone to grant access.
- A subscription can exist before the first invoice is fully paid.

### 3. `customer.subscription.updated`

Stripe sends this whenever the subscription changes.

Common cases:
- Plan upgrade or downgrade
- Monthly to yearly switch, or yearly to monthly switch
- `cancel_at_period_end` turned on or off
- Status changes such as `active`, `past_due`, or `unpaid`
- Renewal-related subscription updates

Use it to:
- Keep the local subscription record in sync.
- Update:
  - `plan_tier`
  - `stripe_status`
  - `cancel_at_period_end`
  - the latest paid-through period end data

Access meaning:
- This is the main subscription state sync event.
- If cancellation is scheduled at period end, keep access until `access_expires_at`.
- If status becomes `unpaid`, revoke access.
- If status becomes `past_due`, usually keep access until the existing `access_expires_at` passes.

### 4. `customer.subscription.deleted`

Stripe sends this when the subscription has fully ended.

Common cases:
- An immediate cancellation
- A cancel-at-period-end subscription reaching the end of its billing period

Use it to:
- Mark the local subscription as ended.
- Stop treating the subscription as active.

Access meaning:
- Revoke access now.
- The paid subscription is over.

### 5. `invoice.paid`

Stripe sends this when a subscription invoice is successfully paid.

Use it to:
- Confirm the billing period was successfully paid.
- Extend the user's `access_expires_at` to the paid-through date.
- Confirm the user should continue to have access.

Access meaning:
- This is the primary grant or extend access event.
- If the invoice is paid, the user keeps access through the paid period.

### 6. `invoice.payment_failed`

Stripe sends this when Stripe attempts to collect a subscription invoice and payment fails.

Use it to:
- Record the billing failure.
- Notify the user that payment needs attention.
- Avoid extending access until Stripe later confirms a successful payment.

Access meaning:
- Do not revoke access immediately if the user still has already-paid time left.
- Keep access only until the current `access_expires_at`.
- If the first invoice never becomes paid, do not grant access.

### 7. `invoice.payment_action_required`

Stripe sends this when the customer must complete an extra verification step before the invoice can be paid.

Typical case:
- A card requires 3D Secure or similar authentication.

Use it to:
- Mark the invoice as blocked pending customer action.
- Prompt the user to complete the required billing step.
- Prevent extending access until the invoice is actually paid.

Access meaning:
- Do not extend access yet.
- If the user still has an active paid period, they keep access only until that current `access_expires_at`.
- If they do not complete the action and no successful payment happens, access ends when the paid period ends.

## Access Rules Summary

For the MVP:
- Grant or extend access on `invoice.paid`.
- Sync subscription metadata on `customer.subscription.created` and `customer.subscription.updated`.
- Revoke access on `customer.subscription.deleted`.
- Do not extend access on `invoice.payment_failed` or `invoice.payment_action_required`.
- Do not treat `checkout.session.completed` as the final billing truth for access.

## Notes For Implementation

- Webhook handlers must verify the Stripe signature.
- Webhook processing must be idempotent because Stripe can retry events.
- Events can arrive out of order, so handlers should sync local state carefully.
- For a simple one-price subscription, use the subscription item's current period end as the paid-through date on modern Stripe API versions.
- Article access checks should read from the local database, not call Stripe on every request.
