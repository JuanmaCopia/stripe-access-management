## 1. Scheduled Job Setup

- [x] 1.1 Add a cron schedule to the `pg-boss` initialization in the worker bootstrap.
- [x] 1.2 Implement the reconciliation job handler to log execution and mock fetching drift.

## 2. Retry Configuration

- [x] 2.1 Update the `PgBossQueueAdapter` consumer options to configure automatic retries for webhook jobs.

## 3. Testing

- [x] 3.1 Verify that the worker tests still pass with the new scheduling configuration.
