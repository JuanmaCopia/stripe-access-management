## ADDED Requirements

### Requirement: Webhook job consumption
The `apps/worker` application SHALL boot a background process that subscribes to the durable queue for Stripe webhook events.

#### Scenario: Bootstrapping the consumer
- **WHEN** the worker is started
- **THEN** it SHALL connect to the database, initialize the queue consumer, and begin processing pending webhook jobs

### Requirement: Subscription state synchronization
The worker SHALL process each webhook job by retrieving the corresponding event from the inbox and passing it to the `SyncStripeSubscriptionUseCase`.

#### Scenario: Processing an invoice.paid event
- **WHEN** the worker consumes a job for an `invoice.paid` event
- **THEN** it SHALL invoke the sync use case to extend local user access and update the subscription metadata, and then acknowledge the job as complete

#### Scenario: Idempotent processing
- **WHEN** the worker receives a job for an event that has already been fully processed or is older than the current local state
- **THEN** it SHALL complete the job without improperly altering the user's access state
