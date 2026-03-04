## ADDED Requirements

### Requirement: Scheduled subscription reconciliation
The `apps/worker` application SHALL register a recurring background job that periodically verifies the accuracy of local subscription projections against the Stripe API.

#### Scenario: Registering the reconciliation schedule
- **WHEN** the worker boots up
- **THEN** it SHALL ensure a scheduled job is registered with the queue adapter to run the reconciliation use case periodically

### Requirement: Local drift repair
The reconciliation use case SHALL fetch the latest state for active or recently modified subscriptions from Stripe and invoke the synchronization logic to correct any discrepancies in `plan_tier`, `stripe_status`, `cancel_at_period_end`, or `access_expires_at`.

#### Scenario: Correcting a missed invoice.paid event
- **WHEN** the reconciliation job detects that a subscription in Stripe has a later paid-through period than the local projection
- **THEN** it SHALL update the local subscription and user access state to reflect the correct paid-through period

## MODIFIED Requirements

### Requirement: Webhook job consumption
The `apps/worker` application SHALL boot a background process that subscribes to the durable queue for Stripe webhook events, and it MUST configure appropriate retry policies for failed jobs to ensure transient errors do not cause permanent drift.

#### Scenario: Bootstrapping the consumer
- **WHEN** the worker is started
- **THEN** it SHALL connect to the database, initialize the queue consumer with automatic retries for failed jobs, and begin processing pending webhook jobs
