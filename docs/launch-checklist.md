# Launch Checklist

This document details the necessary steps and environment configurations required to deploy the Stripe Access Management MVP to a production environment.

## 1. Environment Variables

Ensure the following variables are securely set in your production environment (e.g., Vercel, Render, AWS Secrets Manager):

### Database
- `DATABASE_URL`: Connection string to your production PostgreSQL database (must include pg-boss extension capabilities).

### Authentication (Auth.js)
- `AUTH_SECRET`: A strong, randomly generated secret for encrypting session cookies.
- `GOOGLE_CLIENT_ID`: Your Google OAuth Client ID.
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth Client Secret.
- `NEXT_PUBLIC_APP_URL`: The public base URL of your deployed web application (e.g., `https://my-app.com`).

### Stripe Integration
- `STRIPE_SECRET_KEY`: Your Stripe production secret key (starts with `sk_live_`).
- `STRIPE_WEBHOOK_SECRET`: The signing secret for your production webhook endpoint.
- `STRIPE_BILLING_PORTAL_CONFIGURATION_ID`: (Optional) Custom configuration ID for the Customer Portal.

### Stripe Catalog Mapping
- `STRIPE_STARTER_MONTHLY_PRICE_ID`
- `STRIPE_STARTER_YEARLY_PRICE_ID`
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_YEARLY_PRICE_ID`
- `STRIPE_ULTRA_MONTHLY_PRICE_ID`
- `STRIPE_ULTRA_YEARLY_PRICE_ID`

## 2. Stripe Dashboard Configuration

1. **Create Products and Prices**: Recreate your MVP tiers (Starter, Pro, Ultra) in the production Stripe Dashboard.
2. **Configure Webhooks**:
   - Go to Developers -> Webhooks.
   - Add a new endpoint pointing to `https://my-app.com/api/webhooks/stripe`.
   - Select the following events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`
     - `invoice.payment_action_required`
   - Reveal and copy the webhook signing secret to your `STRIPE_WEBHOOK_SECRET` environment variable.
3. **Configure Customer Portal**: Ensure the portal settings allow users to cancel or update their subscriptions as intended.

## 3. Database Migration

Run the Prisma migrations against the production database:
```bash
pnpm db:migrate:deploy
```
*(Do not run `db:reset` or `db:seed` against the production database unless initializing a blank instance).*

## 4. Deployment Verification

After deployment, perform a smoke test:
- Attempt to sign in with a real Google account.
- Attempt to navigate to the pricing page and start a Checkout session.
- Verify that the worker process is running and successfully polling the `pg-boss` queue without connection errors.
