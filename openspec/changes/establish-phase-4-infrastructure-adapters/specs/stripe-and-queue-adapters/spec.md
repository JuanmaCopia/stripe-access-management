## ADDED Requirements

### Requirement: Infrastructure must provide a Stripe billing gateway for the core billing use cases
The infrastructure layer SHALL provide a Stripe-backed billing gateway that implements the Phase 3 checkout and billing portal ports from server-side code. The gateway MUST accept internal plan or user inputs from the core-facing contract and return transport-neutral outcomes rather than raw Stripe SDK objects.

#### Scenario: Checkout gateway composition review
- **WHEN** server-side composition code invokes the infrastructure billing gateway for a supported plan selection
- **THEN** the adapter SHALL create the Stripe-hosted billing session and return the normalized session information required by the core use case contract

### Requirement: Infrastructure must normalize supported Stripe events into core billing contracts
The infrastructure layer SHALL translate the supported MVP Stripe event types into the normalized Phase 3 billing-event contract, including subscription identifiers, customer identifiers, price mapping, plan tier, billing interval, status, and paid-through period data where applicable. Stripe SDK payload shapes MUST remain inside infrastructure mappers and handlers.

#### Scenario: Stripe event mapping review
- **WHEN** the application receives a supported Stripe webhook event such as `invoice.paid` or `customer.subscription.updated`
- **THEN** infrastructure mapping code SHALL be able to produce the normalized event contract expected by the Phase 3 core webhook and synchronization use cases

### Requirement: Infrastructure must provide a durable `pg-boss` queue adapter
The infrastructure layer SHALL provide a `pg-boss` queue adapter that can publish and consume the internal webhook-processing job intents against the shared PostgreSQL instance without requiring application-owned Prisma models for queue internals.

#### Scenario: Queue publish and consume review
- **WHEN** infrastructure composition code publishes a webhook-processing job and a worker consumer subscribes to that job type
- **THEN** the queue adapter SHALL support both operations through internal job contracts backed by `pg-boss`
