# Name generator contracts

Experimental, isolated contracts for the fantasy name generator foundation.
Import via `@rpg/contracts/name-generator` — **not** included in the root
`@rpg/contracts` barrel.

## Scope

- Naming associations, conventions, structures, and collections
- Generation request/result shapes and provenance metadata
- `NamingContext` / `NamingRecommendation` for convention scoring

## Out of scope

- Campaign persistence (`CampaignNamingProfile` — future integration package)
- Species schema changes or embedded name lists
- UI and API routes

See [`packages/name-generator-data/README.md`](../../../name-generator-data/README.md)
(when added) for dataset and lazy-loading documentation.
