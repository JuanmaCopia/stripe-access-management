# Environment Strategy

This repository keeps the environment strategy intentionally lightweight in Phase 1.

## Conventions

- Shared variable names and onboarding notes live in the root `.env.example`.
- The local PostgreSQL workflow reads its connection details from the root `.env` file.
- The Next.js app will use `apps/web/.env.local` for local runtime variables because Next.js loads app-local environment files automatically.
- The worker will use `apps/worker/.env` once runtime configuration is introduced in a later phase.
- Secrets stay out of git. Only example files and documentation are committed.

## Current Scope

The database layer now uses the root `.env` file for local Prisma and PostgreSQL commands.

Current variables:
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `DATABASE_URL`

Actual runtime validation for auth, Stripe, and worker configuration will be added in later phases as those integrations land.
