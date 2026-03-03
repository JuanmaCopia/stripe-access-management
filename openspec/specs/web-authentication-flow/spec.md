# web-authentication-flow Specification

## Purpose
TBD - created by archiving change establish-phase-5-authentication-and-user-session-flow. Update Purpose after archive.
## Requirements
### Requirement: Web app MUST provide an Auth.js-backed Google sign-in and sign-out flow
The `apps/web` application SHALL expose an Auth.js-powered authentication flow that uses Google as the default MVP provider and supports both sign-in and sign-out from the web experience. The implementation MUST keep Google-specific details inside the web auth adapter rather than spreading them through unrelated application code.

#### Scenario: User starts sign-in from the web app
- **WHEN** an unauthenticated user chooses to sign in from the web application
- **THEN** the app SHALL initiate the Auth.js flow for the configured Google provider

#### Scenario: Authenticated user signs out
- **WHEN** an authenticated user chooses to sign out
- **THEN** the app SHALL end the active application session and return the user to the signed-out experience

### Requirement: Successful authentication MUST establish or reuse a stable local user record
The web authentication flow SHALL use the infrastructure auth scaffolding to ensure that a successful Google login creates or links a stable local user record before authenticated application flows depend on it. Returning sign-ins MUST reuse the existing linked user instead of creating duplicates.

#### Scenario: First-time Google login creates a local user
- **WHEN** a user completes Google sign-in for the first time and no linked local user exists yet
- **THEN** the app SHALL create or link a local user record and persist the provider-account relationship before treating the session as authenticated

#### Scenario: Returning Google login reuses the linked local user
- **WHEN** a user completes Google sign-in and a linked local user already exists
- **THEN** the app SHALL reuse that local user record for the authenticated session instead of creating a second user

### Requirement: Member-only web areas MUST enforce authentication on the server
Protected member-area pages and authenticated server entry points in `apps/web` SHALL enforce authentication before returning protected responses. This enforcement MUST happen on the server and MUST NOT rely only on client-side UI checks.

#### Scenario: Unauthenticated request to a protected area
- **WHEN** an unauthenticated request targets a protected member page or authenticated server entry point
- **THEN** the app SHALL deny direct access and redirect or respond according to the protected-flow contract

#### Scenario: Authenticated request to a protected area
- **WHEN** an authenticated request targets a protected member page or authenticated server entry point
- **THEN** the app SHALL allow the request to continue using the resolved local user context

