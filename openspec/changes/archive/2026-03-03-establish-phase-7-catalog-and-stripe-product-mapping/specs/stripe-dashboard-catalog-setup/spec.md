## ADDED Requirements

### Requirement: Repository SHALL document the MVP Stripe catalog setup contract
The repository SHALL document the Stripe dashboard products, recurring prices, and environment variables required to configure the MVP catalog so contributors can align local, test, and deployed environments without reverse-engineering the code.

#### Scenario: Developer prepares Stripe catalog configuration
- **WHEN** a developer needs to configure the MVP Stripe products and recurring prices
- **THEN** the repository SHALL provide setup notes that identify the required Stripe products, the six recurring prices, and the environment variables that map them into the application

### Requirement: Shared environment examples SHALL expose the required catalog variables
The repository SHALL expose the Stripe catalog environment variables in the shared example environment file so the required configuration surface is visible before billing flows are implemented.

#### Scenario: Developer reviews the example environment file
- **WHEN** a developer opens the shared environment example before configuring Stripe billing
- **THEN** the file SHALL include placeholders for the catalog-related Stripe product and price identifiers required by the MVP
