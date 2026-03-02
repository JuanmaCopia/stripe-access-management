## 1. Establish the database runtime and tooling

- [x] 1.1 Add PostgreSQL and Prisma dependencies plus the root and package-level scripts needed for database development
- [x] 1.2 Add the Prisma workspace structure under `packages/database`, including schema, migration, and seed entry points
- [x] 1.3 Document or script the local PostgreSQL bootstrap workflow for developers

## 2. Create the initial Prisma schema and migration

- [x] 2.1 Model the auth persistence tables needed for the local user and Auth.js adapter workflow
- [x] 2.2 Model the article, subscription, and Stripe webhook inbox tables with the MVP-required fields
- [x] 2.3 Add the enums and constraints for plan tiers, billing intervals, local Stripe status projection, uniqueness, and relationships
- [x] 2.4 Generate and commit the first Prisma migration for the initial schema

## 3. Add the database package boundary and seed workflow

- [x] 3.1 Expose the generated Prisma client through `packages/database/src` as the shared persistence entry point
- [x] 3.2 Ensure the Phase 2 database package boundary keeps direct Prisma usage out of unrelated packages and the core domain
- [x] 3.3 Implement a repeatable seed workflow that creates representative Starter, Pro, and Ultra articles for local development
- [x] 3.4 Verify that the local database boots, migrations run successfully, and the seed workflow completes against the initial schema
