# Database Setup

Phase 2 uses PostgreSQL and Prisma for the local database foundation.

## Local bootstrap

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Start PostgreSQL:

   ```bash
   pnpm db:up
   ```

3. Apply the committed migrations:

   ```bash
   pnpm db:migrate
   ```

4. Seed representative development content:

   ```bash
   pnpm db:seed
   ```

## Creating a new migration

When the schema changes, create a new migration from the database package so Prisma can prompt for a migration name:

```bash
pnpm --filter @stripe-access-management/database exec prisma migrate dev --schema prisma/schema.prisma --name <migration_name>
```

## Useful commands

- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:migrate:dev`
- `pnpm db:migrate:deploy`
- `pnpm db:reset`
- `pnpm db:seed`
- `pnpm db:studio`
- `pnpm db:logs`
- `pnpm db:down`

## Scope

The database package owns Prisma schema management, migrations, and the generated client boundary. Later phases should depend on `@stripe-access-management/database` instead of importing Prisma directly outside that package.
