# @rpg/catalog

System SRD seed data for RPG World Builder — validated JSON catalogs and loaders
shared across apps.

## Scope

- **In:** static system content (`srd-cc-5.2.1` JSON), `loadSeed*` loaders, slug
  guards, and `get*BySlug` pick helpers.
- **Out:** campaign overlays, homebrew, and API merge logic (those stay in
  `@rpg/api`).

## Consumers

| App / package    | Use                                                                                 |
| ---------------- | ----------------------------------------------------------------------------------- |
| `@rpg/api`       | `loadSystem` / `systemSlugs` in content type configs; rules seeds for ruleset-patch |
| `@rpg/dashboard` | Storybook fixtures via slug picks                                                   |
| `@rpg/public`    | Future rules/marketing pages (build-time import)                                    |

## Imports

Tree-shake by content type:

```ts
import { loadSeedSpecies, getSpeciesBySlug } from '@rpg/catalog/species'
import { loadSeedClasses, getClassBySlug } from '@rpg/catalog/classes'
import { getStandardXpProgression } from '@rpg/catalog/xp-progressions'
import { getStandardStartingWealthRules } from '@rpg/catalog/starting-wealth'
import { loadSeedCreatureTypes } from '@rpg/catalog/vocabulary'
```

## Validation

Each loader parses JSON through the matching `@rpg/contracts` Zod schema at
module load so malformed seed data fails in CI, not at request time.

Campaign-customizable vocabulary sets (`@rpg/catalog/vocabulary`) follow the
same pattern; see [docs/vocabulary.md](../../docs/vocabulary.md).

Starting wealth is **not** a content type — `@rpg/catalog/starting-wealth` ships
the SRD rules body (`startingWealthRulesSchema`) for ruleset-patch resolution via
`getStandardStartingWealthRules()`. Legacy envelope helpers (`loadSeedStartingWealth`,
`getStandardStartingWealth`) remain for catalog tests and deterministic table ids.

## Commands

```sh
pnpm --filter @rpg/catalog test
pnpm --filter @rpg/catalog typecheck
```

### Spell structured data scripts

Apply manifest data into `src/spells/data/srd-cc-5.2.1/level-*.json` (requires `tsx`):

```sh
pnpm exec tsx packages/catalog/scripts/apply-spell-seed-resolution.mjs
pnpm exec tsx packages/catalog/scripts/apply-spell-modeling-metadata.mjs
pnpm catalog:spell-modeling-audit
pnpm catalog:spell-modeling-report
```

Manifests live in `src/spells/spell-seed-resolution.ts` and `spell-modeling-manifest.ts`.
The resolution manifest covers all 24 structured-effect slugs: Tier A applicable entries,
Tier B hybrid (Eldritch Blast), Tier D healing/temporary-HP entries, and explicit
`kind: 'defer'` rows with documented reason codes in `spell-seed-resolution.ts`.
The modeling manifest promotes editor-eligible resolution seeds to `meaningful-partial`
(with gap codes where prose riders remain) and marks terminal prose-only spells as
reviewed. Operational inventory: `docs/analysis/spell-modeling-inventory.generated.md`.
