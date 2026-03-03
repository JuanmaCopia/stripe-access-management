## 1. Establish the web authentication foundation

- [x] 1.1 Add the Auth.js and Google-provider dependencies plus required runtime configuration support to `apps/web`
- [x] 1.2 Create the Auth.js server configuration and route handler in `apps/web` without leaking provider details outside the web auth module
- [x] 1.3 Add the first web auth entry points for sign-in initiation and sign-out completion

## 2. Link authenticated sessions to stable local users

- [x] 2.1 Wire successful Auth.js sign-ins through the Phase 4 infrastructure auth scaffolding so local users and provider-account links are created or reused deterministically
- [x] 2.2 Ensure the authenticated session carries the local user information needed by later web routes and pages
- [x] 2.3 Verify first-time and returning sign-ins both resolve to a single stable local user record

## 3. Add server-side session helpers and protected-route behavior

- [x] 3.1 Implement reusable server-side session helpers that return a normalized authenticated or unauthenticated result for `apps/web`
- [x] 3.2 Implement a reusable authentication guard for protected pages and server entry points
- [x] 3.3 Apply the guard to the first member-only web areas so unauthenticated access is redirected or denied on the server

## 4. Verify authenticated and unauthenticated flows

- [x] 4.1 Add focused tests for local user linking, session resolution, sign-in or sign-out behavior, and protected-route outcomes
- [x] 4.2 Verify the workspace lint, typecheck, test, and build flows pass with the new web authentication surfaces in place
