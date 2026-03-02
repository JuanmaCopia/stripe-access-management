## Context

Phase 0 closed the planning baseline and explicitly limited Phase 1 to scaffolding, tooling, and workspace setup. The repository still does not have the monorepo structure, package manifests, app entry points, or shared developer tooling needed to begin implementation.

This change is cross-cutting because it establishes the filesystem layout and shared configuration that every later phase will rely on. It must support the planned modular monolith shape while keeping business logic out of the scaffold itself.

## Goals / Non-Goals

**Goals:**
- Create the root monorepo structure for `web`, `worker`, and shared packages
- Make the workspace installable and runnable through shared root scripts
- Provide baseline TypeScript, lint, format, environment, and path alias configuration
- Encode package boundaries early enough to discourage dependency violations in later phases

**Non-Goals:**
- Implementing database schema, domain logic, auth flows, or Stripe integrations
- Adding a build orchestrator beyond the workspace package manager
- Adding production infrastructure or deployment automation
- Creating article content management features beyond future seed support

## Decisions

### Decision: Use `pnpm` workspaces as the Phase 1 package management model

The monorepo will use `pnpm` workspaces as the root package management layer.

Why this decision:
- It matches the planned repository shape and keeps the toolchain small.
- It provides fast installs and native workspace support without introducing another orchestration layer.

Alternatives considered:
- `npm` workspaces.
  - Simpler for some teams, but weaker fit with the planned multi-package workflow and workspace ergonomics.
- Add Turborepo or Nx immediately.
  - More powerful, but unnecessary complexity for the MVP scaffold.

### Decision: Scaffold both deployable apps and all shared packages from the start

Phase 1 will create `apps/web`, `apps/worker`, `packages/core`, `packages/infrastructure`, `packages/database`, and `packages/testing` immediately, even if many remain thin placeholders at first.

Why this decision:
- It makes the intended boundaries real before implementation pressure encourages shortcuts.
- It lets later phases land in the correct package instead of requiring moves and rewrites.

Alternatives considered:
- Start with only a Next.js app and split later.
  - Faster to boot, but it raises the risk that worker and shared-core concerns leak into the web app.
- Create only the apps and defer shared packages.
  - Less up-front structure, but weaker boundary enforcement and more refactoring later.

### Decision: Keep app boot paths minimal and logic-free

`apps/web` and `apps/worker` will be bootable after Phase 1, but only with placeholder entry points and no business behavior.

Why this decision:
- It satisfies the roadmap exit criteria without smuggling domain, database, or billing logic into the scaffold.
- It gives the team a stable shell for later phases to fill in incrementally.

Alternatives considered:
- Delay app boot until later phases.
  - Reduces initial work, but weakens verification that the workspace is wired correctly.

### Decision: Centralize shared developer configuration while keeping package ownership explicit

The workspace will use shared root configuration for TypeScript, linting, formatting, and common scripts, with package-level manifests and config extensions where needed.

Why this decision:
- It keeps tooling consistent across apps and packages.
- It reduces duplication while preserving clear ownership at the package level.

Alternatives considered:
- Duplicate config per package.
  - More isolated, but harder to maintain and more likely to drift.
- Force everything through a single root config with no local overrides.
  - Simpler initially, but too rigid once app-specific needs emerge.

### Decision: Define environment loading strategy and boundary rules now, but keep validation lightweight

Phase 1 will establish env file conventions, script expectations, path aliases, and package-boundary rules, while deferring strict runtime validation to the phases that introduce real variables and integrations.

Why this decision:
- It gives Phase 2 and beyond a clear contract without inventing unused infrastructure.
- It avoids blocking scaffold work on details that only matter once database, auth, and Stripe configuration exist.

Alternatives considered:
- Skip env strategy until integrations exist.
  - Faster short-term, but causes inconsistent setup patterns later.
- Build full env validation in Phase 1.
  - More robust, but premature before real variables and adapters are added.

## Risks / Trade-offs

- [Too much tooling too early] -> Keep the stack small: `pnpm`, TypeScript, lint, format, and existing framework tooling only.
- [Scaffold drifts from planned architecture] -> Mirror the folder structure defined in the architecture doc and keep placeholders in the correct packages from day one.
- [Boundary rules remain aspirational] -> Back them with package surfaces, path aliases, and lint import restrictions where practical.
- [Phase 1 scope expands into feature work] -> Verify every task against the explicit Phase 1 non-goals before implementation.

## Migration Plan

1. Create the root workspace files and package manager configuration.
2. Scaffold the planned apps and shared packages with baseline manifests and entry points.
3. Add shared TypeScript, lint, format, env, and path alias configuration.
4. Add root scripts and package-level scripts for install, dev, build, lint, test, and typecheck workflows.
5. Verify that the empty scaffold installs cleanly, boots the web and worker entry points, and passes typecheck.

Rollback is low risk because this change only adds scaffolding and configuration. If a tooling choice proves wrong early, the workspace can be adjusted before feature code accumulates.

## Open Questions

- None for proposal readiness. The Phase 1 constraints are already frozen by the Phase 0 baseline.
