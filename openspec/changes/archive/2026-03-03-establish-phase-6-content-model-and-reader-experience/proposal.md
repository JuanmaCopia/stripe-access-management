## Why

Phase 5 established a stable authenticated session boundary, but the product still does not let members browse or read tiered articles through the web experience. Phase 6 needs to turn the existing database, core access rules, and auth flow into a usable content surface now so we can validate locked versus unlocked behavior before checkout, billing portal, and webhook work are layered on top.

## What Changes

- Add the first real content-facing web experience in `apps/web`, including a public landing and pricing shell plus authenticated dashboard and article routes.
- Extend local seed content so development and tests have representative `STARTER`, `PRO`, and `ULTRA` articles to exercise access behavior.
- Compose the existing Phase 3 content use cases with the Phase 4 adapters inside the web app so dashboard listing and article reads stay behind clean boundaries.
- Render locked and unlocked article states from server-side access decisions and keep protected article bodies off the wire when access is denied.

## Capabilities

### New Capabilities
- `member-content-reader-experience`: Covers the public landing shell, member dashboard article listing, article detail rendering, and server-enforced locked or unlocked article behavior in `apps/web`.
- `seeded-tiered-content-fixtures`: Covers the sample article content required to exercise all three subscription tiers in local development and automated verification.

### Modified Capabilities

None.

## Impact

- Primarily affects `apps/web`, `packages/database`, and the shared infrastructure composition used to wire content use cases into the web layer.
- Builds directly on the existing `content-access-use-cases`, `web-authentication-flow`, and `server-session-access` capabilities without changing their contracts.
- Creates the member-facing content experience that later catalog, checkout, billing portal, and webhook phases will build on.
