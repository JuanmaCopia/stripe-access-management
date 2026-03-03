# seeded-tiered-content-fixtures Specification

## Purpose
TBD - created by archiving change establish-phase-6-content-model-and-reader-experience. Update Purpose after archive.
## Requirements
### Requirement: Local seed flow SHALL create representative published articles for each tier
The repository's local seed flow SHALL create deterministic published article fixtures that cover `STARTER`, `PRO`, and `ULTRA` access levels so the member dashboard and article routes can be exercised without manual content entry.

#### Scenario: Developer seeds the local database
- **WHEN** a developer runs the seed command for the local database
- **THEN** the seeded data SHALL include published articles for all three supported subscription tiers

### Requirement: Seeded article fixtures SHALL provide stable identifiers and metadata for verification
The seeded article set SHALL provide stable titles, slugs, summaries, and required tiers so automated tests and manual verification can reliably target locked and unlocked reading scenarios across environments.

#### Scenario: Test or developer targets a seeded article
- **WHEN** a test or developer references a seeded article fixture after seeding
- **THEN** the article SHALL expose stable identifying fields and the required access tier needed to verify the expected locked or unlocked outcome

