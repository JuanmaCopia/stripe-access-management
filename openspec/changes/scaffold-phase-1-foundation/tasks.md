## 1. Create the root workspace foundation

- [x] 1.1 Add the root `package.json` and `pnpm-workspace.yaml` configuration for the monorepo
- [x] 1.2 Define root workspace scripts for `dev`, `build`, `test`, `lint`, and `typecheck`
- [x] 1.3 Add the shared root files needed for baseline repository operation, such as TypeScript base config placeholders and any required ignore or config files

## 2. Scaffold apps and shared packages

- [x] 2.1 Create `apps/web` with a bootable placeholder application shell and package manifest
- [x] 2.2 Create `apps/worker` with a bootable placeholder entry point and package manifest
- [x] 2.3 Create `packages/core`, `packages/infrastructure`, `packages/database`, and `packages/testing` with baseline package manifests and entry surfaces
- [x] 2.4 Ensure the scaffolded apps and packages do not contain domain, database, auth, or billing logic

## 3. Add shared developer tooling and verify the scaffold

- [x] 3.1 Add shared TypeScript configuration and package-level extensions for apps and packages
- [x] 3.2 Add shared linting, formatting, path alias, and package-boundary configuration
- [x] 3.3 Define the Phase 1 environment-loading convention and any example env files or placeholders needed for later phases
- [x] 3.4 Verify that the workspace installs cleanly, the web and worker boot, and root `typecheck` passes on the empty scaffold
