## Context

Phase 4 is now complete, so the repository has working Prisma, queue, Stripe, logging, configuration, and Auth.js-oriented infrastructure scaffolding. The missing piece is the actual web authentication flow: `apps/web` still has no Auth.js route, no provider wiring, no current-user helper, no protected member routes, and no sign-in or sign-out UI.

Phase 5 is cross-cutting across the `web` delivery layer and the existing infrastructure auth scaffolding, but it must still preserve the current clean-architecture boundary. The core should continue to know only about local users and use-case inputs, while Auth.js and Google remain adapter choices owned by the web and infrastructure layers.

## Goals / Non-Goals

**Goals:**
- Add Auth.js to `apps/web` with Google as the default MVP provider
- Reuse the Phase 4 infrastructure auth scaffolding so first-time sign-ins create or link a stable local user record
- Add reusable server-side session and current-user helpers for App Router pages, route handlers, and future billing or content guards
- Add sign-in and sign-out entry points plus protected member-area behavior
- Add focused tests for authenticated and unauthenticated flows without waiting for later dashboard or billing phases

**Non-Goals:**
- Add non-Google providers, email-based authentication, or account settings flows
- Move authentication concepts into `packages/core`
- Implement checkout, billing portal, webhook, or article access features that depend on later phases
- Introduce a custom auth store, external identity service, or client-heavy session architecture

## Decisions

### Decision: Keep Auth.js in `apps/web`, but map it immediately to a local-user session surface

Auth.js configuration, provider setup, and route wiring will live in `apps/web`, but the rest of the web server code will depend on a small local-user session helper rather than importing Auth.js primitives everywhere. The helper should resolve the current authenticated app user, expose whether the request is authenticated, and provide a reusable guard for protected pages and routes.

Why this decision:
- It keeps Google and Auth.js as delivery-layer details instead of letting them become de facto application types.
- It gives later phases a stable way to gate dashboard, billing, and content flows without duplicating auth logic.

Alternatives considered:
- Let each route or page call Auth.js directly.
  - Faster to wire initially, but it spreads provider- and framework-specific details across the app and makes later auth changes harder.
- Add a core session port now.
  - Cleaner in theory, but unnecessary for the MVP because Phase 5 is still delivery-layer integration rather than core business logic.

### Decision: Use the Phase 4 infrastructure auth scaffolding as the single local-user linking path

The existing `PrismaAuthScaffoldingStore` in `packages/infrastructure` will be the path that creates or links local users from Google provider profiles. Auth.js callbacks and supporting server utilities should call that adapter instead of re-implementing account linking in `apps/web`.

Why this decision:
- It reuses the boundary already established in Phase 4 and prevents duplicate persistence logic in the web app.
- It makes local user creation deterministic and easier to test than embedding Prisma or Auth.js-specific persistence logic in callback code.

Alternatives considered:
- Use only the stock Auth.js Prisma adapter patterns directly in `apps/web`.
  - Faster to scaffold, but it would weaken the existing infrastructure boundary and duplicate user-linking logic.
- Delay local user linking until a later request after sign-in.
  - Simpler callback code, but it makes session-dependent features brittle because the app cannot rely on a local user existing immediately after authentication.

### Decision: Protect member-only routes and pages on the server with redirects, not client-only UI checks

Protected areas in the App Router should use server-side guards that redirect unauthenticated users to sign in, optionally preserving the original destination for a smoother post-login return. Public routes should remain public, and protected pages should be the canonical place where later billing or content features assume authentication.

Why this decision:
- It aligns with the product requirement that enforcement must not rely on UI-only state.
- It creates a predictable, reusable entry point for later authenticated flows.

Alternatives considered:
- Gate member access only in client components after hydration.
  - Faster to prototype, but weaker for security, slower for user experience, and inconsistent with the architecture direction.
- Delay route protection until the dashboard or billing phases.
  - Reduces Phase 5 scope slightly, but it would leave no stable authenticated boundary for subsequent phases to build on.

### Decision: Add minimal auth UI now rather than a full account experience

Phase 5 will provide the MVP sign-in and sign-out entry points needed to exercise the auth flow, plus lightweight protected-area behavior. It will not try to design the final navigation, account settings, or member dashboard experience yet.

Why this decision:
- It gives enough real UI to validate authentication behavior without dragging Phase 6 layout and content concerns into auth work.
- It keeps the MVP biased toward shipping the smallest complete user flow first.

Alternatives considered:
- Build a richer account area now.
  - Potentially nicer UX, but it overlaps with later phases and adds avoidable front-end scope.
- Omit UI and test only the backend flow.
  - Lower implementation cost, but weaker product validation and less confidence that the auth path is actually usable.

### Decision: Favor focused web integration tests over broad end-to-end browser orchestration

Phase 5 testing should validate the highest-risk auth seams: session resolution, local user linking, protected-route behavior, and authenticated versus unauthenticated outcomes. It should not attempt a full browser-driven Google OAuth flow in this phase.

Why this decision:
- It keeps feedback loops manageable while still validating the behavior that later phases depend on.
- It avoids coupling proposal scope to third-party login automation complexity too early.

Alternatives considered:
- Rely only on manual testing for auth.
  - Faster short term, but too risky for a boundary that later phases will depend on heavily.
- Build full end-to-end provider automation now.
  - More realistic, but too expensive relative to the MVP scope and current app maturity.

## Risks / Trade-offs

- [Auth.js details leak broadly through the app] -> Centralize provider setup and expose local-user session helpers for the rest of `apps/web`.
- [Local user creation drifts from provider sign-in behavior] -> Reuse the Phase 4 infrastructure auth scaffolding as the only linking path.
- [Protected-route behavior becomes inconsistent across pages and APIs] -> Add a shared server-side guard pattern instead of ad hoc checks.
- [Google-only login limits future flexibility] -> Accept the MVP speed tradeoff while keeping provider-specific code isolated to the web auth adapter.
- [Testing misses real integration issues] -> Cover session lookup, local user linking, and route protection with focused integration tests and defer full OAuth browser automation.

## Migration Plan

1. Add the Auth.js and Google provider dependencies plus any required web test support.
2. Create the Auth.js server configuration, route handler, and environment validation inside `apps/web`.
3. Wire sign-in callbacks or hooks to the infrastructure auth scaffolding so a local user is always linked on successful authentication.
4. Add server-side session helpers and protected-route guards for App Router pages and route handlers.
5. Add minimal sign-in and sign-out UI entry points and protect the first member-only areas.
6. Add focused tests for authenticated and unauthenticated flow behavior, then verify the workspace still builds, typechecks, and tests cleanly.

Rollback is moderate because Phase 5 will introduce the first real authenticated boundary in `apps/web`, but the risk is still lower now than after content and billing flows depend on ad hoc auth code. The main rollback path is to remove the web auth wiring while preserving the Phase 4 infrastructure scaffolding.

## Open Questions

- None for proposal readiness. The exact Auth.js file layout and callback names can be decided during implementation as long as the boundary and local-user session rules remain unchanged.
