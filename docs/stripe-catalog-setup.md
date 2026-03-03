# Stripe Catalog Setup

The MVP uses three Stripe products and six recurring prices. Stripe products represent memberships, not individual articles.

## Products

- `starter`
- `pro`
- `ultra`

## Prices

Create one recurring price for each tier and billing interval combination:

- Starter monthly
- Starter yearly
- Pro monthly
- Pro yearly
- Ultra monthly
- Ultra yearly

## Environment mapping

Map the Stripe dashboard identifiers into the application with these variables:

- `STRIPE_STARTER_PRODUCT_ID`
- `STRIPE_STARTER_MONTHLY_PRICE_ID`
- `STRIPE_STARTER_YEARLY_PRICE_ID`
- `STRIPE_PRO_PRODUCT_ID`
- `STRIPE_PRO_MONTHLY_PRICE_ID`
- `STRIPE_PRO_YEARLY_PRICE_ID`
- `STRIPE_ULTRA_PRODUCT_ID`
- `STRIPE_ULTRA_MONTHLY_PRICE_ID`
- `STRIPE_ULTRA_YEARLY_PRICE_ID`

## Notes

- The same product id is reused across monthly and yearly prices for a tier.
- Price ids must be unique across all six bindings.
- Lookup keys stay internal and deterministic: `starter-monthly`, `starter-yearly`, `pro-monthly`, `pro-yearly`, `ultra-monthly`, and `ultra-yearly`.
