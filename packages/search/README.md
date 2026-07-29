# @rpg/search

Framework-neutral candidate matching and generic ranking mechanics for RPG
World Builder surfaces.

## Exports

| Entry                 | Purpose                                                             |
| --------------------- | ------------------------------------------------------------------- |
| `@rpg/search`         | `SearchDocument` matching — normalize, score, `SearchMatch`         |
| `@rpg/search/ranking` | Pure comparators — `chainComparators`, `compareNumberDescending`, … |

## Usage sketch

```ts
import { matchSearchDocument, normalizeSearchQuery } from '@rpg/search'
import { chainComparators, compareNumberDescending } from '@rpg/search/ranking'

const match = matchSearchDocument(document, normalizeSearchQuery(query))
```

Surfaces assemble `SearchDocument` values locally (often from `@rpg/contracts`
field helpers), match with `@rpg/search`, then compose sort pipelines with
`@rpg/search/ranking`.

## B1 baseline semantics

- Query normalization: trim + lower-case only (no tokenization yet).
- Whole-string exact / prefix / substring match per field; document score = best field.
- Empty query: `{ matched: true }` with no tier or score.
- Field `weight` overrides the role default multiplier when present.

Detail: [docs/matching-and-ranking.md](./docs/matching-and-ranking.md).

## Boundaries

`@rpg/search` does not depend on React, `@rpg/contracts`, apps, or Zod.
Production consumers:

- **Equipment picker** (dashboard) — assembled `SearchDocument`, `@rpg/search` matching, `@rpg/search/ranking` sort composition.
- **ComboboxField** (`@rpg/ui`) — `assembleComboboxOptionSearchDocument` adapter; filter-only (no score-based reorder).
