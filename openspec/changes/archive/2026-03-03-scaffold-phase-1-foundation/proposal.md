## Why

Phase 0 established the architecture and delivery contract, but the repository still lacks the monorepo scaffold and shared tooling needed to start implementation safely. Phase 1 needs to create that foundation now so later phases can add database, domain, and billing behavior without collapsing clean-architecture boundaries.

## What Changes

- Scaffold the workspace as a monorepo with the planned apps and shared packages.
- Add the root package manager, workspace, and shared script configuration needed for local development and CI.
- Create bootable baseline entry points for `apps/web` and `apps/worker` without adding business logic.
- Add shared TypeScript, linting, formatting, environment-loading, path alias, and package-boundary configuration.
- Establish the package surfaces that later phases will implement: `core`, `infrastructure`, `database`, and `testing`.

## Capabilities

### New Capabilities
- `workspace-bootstrap`: Defines the required monorepo structure, package/app scaffolding, and root development scripts for the project.
- `developer-tooling-foundation`: Defines the shared TypeScript, lint, format, environment, path alias, and package-boundary setup required before feature implementation begins.

### Modified Capabilities

None.

## Impact

- Affects root workspace configuration files such as `package.json`, `pnpm-workspace.yaml`, TypeScript config, lint/format config, and env templates
- Adds scaffolded directories and baseline package manifests for `apps/web`, `apps/worker`, and shared packages
- Establishes the developer workflow for install, dev, build, lint, test, and typecheck
- Creates the safe starting point for Phase 2 and beyond
