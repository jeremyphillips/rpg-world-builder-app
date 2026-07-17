# @rpg/name-generator-data

Fixture naming conventions, lazy-loadable collection assets, and registry
loaders for the experimental name generator foundation.

## Scope

- Eager convention manifest (`listConventions`, `getConvention`)
- Lazy collection loading (`loadNameCollection`) via trusted import map
- Fixture cultures and cross-domain sample data (not production datasets)

## Out of scope

- UI, API routes, and campaign persistence
- Character-builder or species schema coupling
- `@rpg/name-generator-integrations` (future resolver layer)

## Consumers

| Workspace          | Use                                          |
| ------------------ | -------------------------------------------- |
| Dashboard (future) | Standalone name-generator page               |
| Tests / tooling    | End-to-end convention + collection workflows |

## Imports

```ts
import {
  listConventions,
  loadNameCollection,
  listCollectionManifestEntries,
} from '@rpg/name-generator-data'
import { recommendConventions, generateNames } from '@rpg/name-generator-core'
```

Typical orchestration:

1. `recommendConventions(context, listConventions())`
2. `loadNameCollection(id)` for each `collectionId` on the chosen convention
3. `generateNames(convention, collectionsMap, request)`

## Language-as-affinity rules

- A language can influence **many** naming conventions (e.g. `elvish` → personal
  and settlement conventions).
- A convention may be influenced by **several** languages and cultures.
- Knowing a language does **not** imply membership in an associated culture.
- Creature type is a **broad fallback**, not a precise naming identity.
- Species, faction, and location associations are **recommendations**, never
  mandatory constraints.
- Campaign data may override or rank conventions without mutating global
  collections (future `CampaignNamingProfile` in integrations package).

## Culture vs region

- `cultureIds` identify precise traditions (`akan`, `high-elf`, `elven-general`).
- `regionIds` are broad browsing facets (`west-africa`) — not substitutes for
  culture labels.

## Provenance

Every **collection** carries data-source provenance. Every **convention** carries
curation provenance. Both are required before a dataset is production-eligible.

## Lazy-loading boundaries

| Module                      | Loads                                         |
| --------------------------- | --------------------------------------------- |
| `conventions/manifest.ts`   | Convention metadata only (eager)              |
| `collections/manifest.ts`   | Manifest entries only (eager)                 |
| `collections/import-map.ts` | Dynamic `import()` map (no eager assets)      |
| `loadNameCollection`        | Validates and caches one collection at a time |

Callers must not supply asset paths — ids resolve only through the manifest and
import map.

## Adding a collection

1. Add `src/collections/<id>.ts` with provenance and generator definition.
2. Register the id in `collections/manifest.ts` and `collections/import-map.ts`.
3. Reference the id from convention `partBindings` and `collectionIds`.

## Adding a convention

1. Add `src/conventions/<id>.ts` with associations, structures, and bindings.
2. Register in `conventions/manifest.ts`.
3. Add co-located tests if the convention introduces new binding patterns.

## Production eligibility

A collection is production-eligible when it has:

- Complete provenance (source, license, methodology)
- Non-trivial, rights-cleared or original data
- Schema validation passing at load time
- Manifest entry with accurate `generatorKinds` and approximate counts

Fixture pools in this package are **not** production-eligible.

## Commands

```bash
pnpm --filter @rpg/name-generator-data test
pnpm --filter @rpg/name-generator-data typecheck
pnpm --filter @rpg/name-generator-data lint
```
