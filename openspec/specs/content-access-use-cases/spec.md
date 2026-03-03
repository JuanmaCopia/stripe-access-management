# content-access-use-cases Specification

## Purpose
TBD - created by archiving change establish-phase-3-core-domain-use-cases. Update Purpose after archive.
## Requirements
### Requirement: Dashboard article listing must project access from local subscription state
The core application SHALL provide a dashboard article-listing use case that returns published article summaries together with locked or unlocked access information derived from the viewer's local subscription state. The use case MUST compute that state locally without live Stripe calls.

#### Scenario: Listing dashboard articles for a paid user
- **WHEN** a signed-in user with active local `PRO` access requests the dashboard article list
- **THEN** the use case SHALL mark `STARTER` and `PRO` articles as unlocked and `ULTRA` articles as locked

### Requirement: Article reads must enforce server-safe access decisions
The core application SHALL provide an article-reading use case that only returns the full published article body when the viewer satisfies the local access policy for the article's required tier and paid-through period. If access is not allowed, the use case MUST return a locked outcome that can be rendered without exposing the protected content body.

#### Scenario: Reading an article without sufficient access
- **WHEN** a user without active `ULTRA` access requests a published `ULTRA` article
- **THEN** the use case SHALL return a locked result and SHALL NOT expose the full article body

### Requirement: The access policy must honor tier inheritance and access expiration
The core access policy SHALL treat `PRO` as including `STARTER`, `ULTRA` as including both lower tiers, and any expired or missing paid-through state as insufficient access. Access decisions MUST be based on local tier and expiration data rather than external billing reads.

#### Scenario: Evaluating expired paid access
- **WHEN** a user previously had `PRO` access but the local paid-through timestamp is now in the past
- **THEN** the access policy SHALL deny access to both `PRO` and `STARTER` protected articles until a later local sync extends access again

