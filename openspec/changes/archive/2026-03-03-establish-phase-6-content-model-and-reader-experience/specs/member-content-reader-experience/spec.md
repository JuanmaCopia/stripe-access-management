## ADDED Requirements

### Requirement: Web app SHALL provide a member content dashboard backed by local access state
The `apps/web` application SHALL provide an authenticated member dashboard that lists published articles and renders each article as locked or unlocked from the existing local access projection. The dashboard MUST obtain that state from the server-side content listing flow rather than duplicating access decisions in client code.

#### Scenario: Signed-in user views the dashboard article list
- **WHEN** an authenticated user opens the member dashboard
- **THEN** the app SHALL render published article summaries with locked or unlocked status derived from the user's local subscription access state

### Requirement: Article detail routes SHALL enforce protected-body access on the server
The web application SHALL provide article detail routes that resolve article access on the server and only render the full protected article body when the signed-in user satisfies the local access policy. When access is denied, the route MUST render a locked state without exposing the protected body content.

#### Scenario: Signed-in user opens a locked article
- **WHEN** an authenticated user requests an article whose required tier exceeds the user's active local access
- **THEN** the app SHALL render a locked article state and SHALL NOT include the full protected body in the response

#### Scenario: Signed-in user opens an unlocked article
- **WHEN** an authenticated user requests an article whose required tier is satisfied by the user's active local access
- **THEN** the app SHALL render the full published article body from the server-side read result

### Requirement: Public web shell SHALL guide users into the member content experience
The `apps/web` application SHALL provide a public landing and pricing shell that explains the tiered reading experience and routes users toward sign-in or the authenticated dashboard without requiring billing flows to exist yet.

#### Scenario: Unauthenticated user visits the public landing page
- **WHEN** an unauthenticated user opens the web home page
- **THEN** the app SHALL render the public content and pricing shell with a path into sign-in for the member reading experience

#### Scenario: Authenticated user visits the public landing page
- **WHEN** an authenticated user opens the web home page
- **THEN** the app SHALL surface a direct path back to the member dashboard and current reading experience
