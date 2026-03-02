# Environment Strategy

This repository keeps the environment strategy intentionally lightweight in Phase 1.

## Conventions

- Shared variable names and onboarding notes live in the root `.env.example`.
- The Next.js app will use `apps/web/.env.local` for local runtime variables because Next.js loads app-local environment files automatically.
- The worker will use `apps/worker/.env` once runtime configuration is introduced in a later phase.
- Secrets stay out of git. Only example files and documentation are committed.

## Phase 1 Scope

No runtime integrations are configured yet, so this phase only establishes the convention and the placeholder files. Actual variable loading and validation will be added when the database, auth, Stripe, and worker configuration layers are implemented.
