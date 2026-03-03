## ADDED Requirements

### Requirement: Server-side web code MUST resolve the current session into a local-user-aware helper
The web application SHALL provide reusable server-side session helpers that resolve whether the current request is authenticated and, when authenticated, return the linked local user context required by later routes, pages, and use-case composition. These helpers MUST present application-facing user information rather than raw Google profile data.

#### Scenario: Authenticated request resolves a local user session
- **WHEN** server-side code asks for the current authenticated user during a request with a valid session
- **THEN** the helper SHALL return an authenticated result that includes the linked local user identity needed by the application

#### Scenario: Unauthenticated request resolves no local user
- **WHEN** server-side code asks for the current authenticated user during a request with no valid session
- **THEN** the helper SHALL return an unauthenticated result without pretending a local user exists

### Requirement: Protected-route helpers MUST provide a reusable guard contract for web delivery code
The web application SHALL provide a reusable guard or wrapper that pages and route handlers can use to enforce authentication consistently. The guard MUST preserve a stable contract for both successful access and unauthenticated outcomes so later features can build on it without re-implementing session logic.

#### Scenario: Guard redirects unauthenticated access
- **WHEN** a protected page or route uses the authentication guard and the request is unauthenticated
- **THEN** the guard SHALL return the configured unauthenticated outcome, such as a redirect to sign in

#### Scenario: Guard supplies authenticated context to protected logic
- **WHEN** a protected page or route uses the authentication guard and the request is authenticated
- **THEN** the guard SHALL provide the resolved local user context to the protected logic without requiring that logic to query Auth.js directly
