# runtime-support-adapters Specification

## Purpose
TBD - created by archiving change establish-phase-4-infrastructure-adapters. Update Purpose after archive.
## Requirements
### Requirement: Infrastructure must provide typed runtime configuration for external adapters
The infrastructure layer SHALL provide runtime configuration surfaces for Stripe, queue, auth scaffolding, and logging-related inputs. These configuration surfaces MUST fail clearly when required adapter configuration is missing or invalid so later phases do not discover broken infrastructure wiring only at request time.

#### Scenario: Missing adapter configuration review
- **WHEN** a developer attempts to initialize an infrastructure adapter without the required runtime configuration
- **THEN** the infrastructure configuration layer SHALL surface a clear failure before the adapter is used in application composition

### Requirement: Infrastructure must provide application-facing logging and composition helpers
The infrastructure layer SHALL provide a logging implementation and composition-ready factories or builders that can wire core use cases to real adapters for web and worker entry points without moving business logic into those entry points.

#### Scenario: Composition root review
- **WHEN** a developer prepares to wire a web route or worker handler against the Phase 3 use cases
- **THEN** the infrastructure package SHALL already expose the logging and adapter composition helpers needed to assemble those use cases with real implementations

### Requirement: Infrastructure must provide Auth.js scaffolding without owning application auth flow decisions
The infrastructure layer SHALL provide Auth.js-oriented scaffolding such as adapter helpers, mapper surfaces, or user-resolution support needed by later authentication work, while deferring route-level Auth.js configuration and user-facing login flows to Phase 5.

#### Scenario: Auth scaffolding review
- **WHEN** the team begins implementing the authentication flow in Phase 5
- **THEN** reusable Auth.js support surfaces SHALL already exist in infrastructure without requiring the core to depend on Auth.js types or route configuration

