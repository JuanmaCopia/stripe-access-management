## Why

Phase 4 established reusable auth scaffolding in `packages/infrastructure`, but the product still has no real sign-in flow, no stable server-side session lookup, and no way to protect member-only pages or billing entry points. Phase 5 needs to wire Auth.js and Google login into `apps/web` now so later content and billing phases can rely on an authenticated local user instead of ad hoc request-time assumptions.

## What Changes

- Add Auth.js configuration to `apps/web`, including the route handler, required runtime configuration, and Google as the default MVP provider.
- Connect the web authentication flow to the existing database and infrastructure auth scaffolding so first-time sign-ins establish or link a stable local user record.
- Add server-side session and current-user helpers that web routes and pages can use without importing Auth.js or Google details everywhere.
- Add sign-in and sign-out UI entry points plus protected member-area behavior for authenticated versus unauthenticated users.
- Add focused tests for the authenticated and unauthenticated web flow, including local user creation, session lookup, and route protection behavior.

## Capabilities

### New Capabilities
- `web-authentication-flow`: Defines the Auth.js and Google-powered sign-in, sign-out, local user establishment, and protected member-area behavior inside `apps/web`.
- `server-session-access`: Defines the server-side helpers and guard behavior that resolve the current local user and gate authenticated routes, pages, and future billing entry points.

### Modified Capabilities

None.

## Impact

- Primarily affects `apps/web` plus the workspace dependencies and environment variables required for Auth.js and Google login.
- Builds directly on the Phase 4 runtime support adapters and auth scaffolding in `packages/infrastructure`.
- Establishes the stable user and session surface that later dashboard, article, checkout, and billing phases will depend on.
