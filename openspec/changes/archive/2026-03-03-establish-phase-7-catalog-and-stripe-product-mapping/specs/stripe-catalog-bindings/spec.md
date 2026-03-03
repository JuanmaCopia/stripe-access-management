## ADDED Requirements

### Requirement: Infrastructure SHALL provide validated Stripe catalog bindings for all MVP plans
The infrastructure layer SHALL provide a binding surface that covers the six supported MVP plan combinations: `STARTER`, `PRO`, and `ULTRA`, each with `MONTHLY` and `YEARLY` billing intervals. Each binding MUST expose a stable internal lookup key, display name, Stripe product identifier, and Stripe price identifier.

#### Scenario: Runtime loads the full MVP catalog
- **WHEN** infrastructure catalog configuration is loaded with all required Stripe identifiers present
- **THEN** the resulting binding set SHALL contain exactly the six supported tier and billing-interval combinations with stable lookup keys and Stripe identifiers

### Requirement: Catalog configuration SHALL fail clearly when identifiers are missing or inconsistent
The infrastructure catalog loader MUST reject incomplete or internally inconsistent catalog configuration before billing flows execute. Missing required identifiers, duplicate selection mappings, duplicate lookup keys, or duplicate Stripe price identifiers SHALL produce clear configuration failures.

#### Scenario: Missing or duplicate catalog configuration is detected
- **WHEN** a developer loads the Stripe catalog bindings with missing required environment variables or conflicting identifiers
- **THEN** the infrastructure layer SHALL raise a clear configuration error instead of producing a partial catalog

### Requirement: Catalog helpers SHALL resolve supported plan selections and Stripe identifiers consistently
The infrastructure layer SHALL support resolution of catalog bindings from internal plan selections, lookup keys, and Stripe identifiers so checkout metadata, webhook normalization, and future route handlers share one mapping contract.

#### Scenario: Supported plan selection resolves to a Stripe binding
- **WHEN** application code requests the binding for a supported internal tier and billing interval
- **THEN** the infrastructure catalog helper SHALL return the matching binding with the expected Stripe product and price identifiers

#### Scenario: Ambiguous product-only lookup does not guess
- **WHEN** application code attempts to resolve a binding from only a Stripe product identifier that corresponds to more than one billing interval
- **THEN** the infrastructure catalog helper SHALL return no match rather than guessing between monthly and yearly prices
