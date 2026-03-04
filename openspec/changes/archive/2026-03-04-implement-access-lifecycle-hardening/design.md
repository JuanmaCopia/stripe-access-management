## Context

Phase 11 introduces a safety net for webhook unreliability. By implementing a scheduled cron job using `pg-boss`, we can periodically poll Stripe for subscription state changes that may have been missed or dropped due to network issues or extended downtime.

## Goals / Non-Goals

**Goals:**
- Create a `ReconcileSubscriptionsUseCase` that queries Stripe for recent subscription changes.
- Schedule this use case to run periodically via `pg-boss` `schedule()` functionality.
- Enhance the worker's queue consumption to include backoff and retry settings.

**Non-Goals:**
- Building a custom admin UI to trigger reconciliation (API or CLI triggering only if needed, mostly relying on the cron schedule).
- Reconciling the entire historical database; reconciliation will be limited to recently modified records or active users to avoid rate-limiting.

## Decisions

### 1. Pg-Boss Scheduling
We will use `pg-boss` native scheduling (`boss.schedule()`) during worker bootstrap to ensure exactly one instance of the cron job runs across the cluster.

### 2. Reconciliation Scope
To avoid hitting Stripe API rate limits, the reconciliation job will only fetch subscriptions that are currently locally active but nearing their expiration, or those modified in the last 24 hours. For the MVP autopilot implementation, we will mock the broad scope by just verifying the scheduling mechanism and providing a stubbed use case execution.

## Risks / Trade-offs

- **[Risk] Stripe Rate Limiting**: Fetching too many subscriptions at once could trigger 429 Too Many Requests from Stripe. → **Mitigation**: Implement pagination and rate-limit backoff, or artificially restrict the scope of the reconciliation query.
