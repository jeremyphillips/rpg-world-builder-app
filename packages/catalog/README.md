# @rpg/catalog

System SRD seed data for RPG World Builder — validated JSON catalogs and loaders
shared across apps.

## Scope

- **In:** static system content (`srd-cc-5.2.1` JSON), `loadSeed*` loaders, slug
  guards, and `get*BySlug` pick helpers.
- **Out:** campaign overlays, homebrew, and API merge logic (those stay in
  `@rpg/api`).

## Consumers

| App / package    | Use                                                  |
| ---------------- | ---------------------------------------------------- |
| `@rpg/api`       | `loadSystem` / `systemSlugs` in content type configs |
| `@rpg/dashboard` | Storybook fixtures via slug picks                    |
| `@rpg/public`    | Future rules/marketing pages (build-time import)     |

## Imports

Tree-shake by content type:

```ts
import { loadSeedSpecies, getSpeciesBySlug } from '@rpg/catalog/species'
import { loadSeedClasses, getClassBySlug } from '@rpg/catalog/classes'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'
```

## Validation

Each loader parses JSON through the matching `@rpg/contracts` Zod schema at
module load so malformed seed data fails in CI, not at request time.

## Commands

```sh
pnpm --filter @rpg/catalog test
pnpm --filter @rpg/catalog typecheck
```
