# @rpg/character-narrative-data

Authored narrative fragments and trusted collection loaders for the character
narrative generator.

The initial collection contains reviewed first-person fragments for three themes:
duty, belonging, and ambition. It includes generic fallbacks plus alignment,
organization, residence, class, species, heritage, and culture references.

## Responsibilities

- Own authored prose, fragment IDs, themes, weights, affinities, and conflict tags.
- Validate templates and token declarations through the narrative contracts.
- Keep collection revision identifiers stable for reproducibility and diagnostics.
- Expose lazy loading so a builder route does not eagerly include all narrative prose.

Data entries are complete sentences or short passages. `{{organization.name}}`,
`{{organization.title}}`, `{{residence.name}}`, `{{class.name}}`,
`{{species.name}}`, `{{heritage.name}}`, and `{{culture.name}}` are the supported
tokens. A fragment must declare every token it uses and must not make campaign
claims that are not represented by the supplied reference.

## Public API

```ts
import { loadNarrativeCollection } from '@rpg/character-narrative-data'

const collection = await loadNarrativeCollection()
```

The collection is intentionally separate from the core so editorial expansion can
continue without changing composition logic. Campaign-authored narrative packs can
later use the same validated collection shape.

## Commands

```bash
pnpm --filter @rpg/character-narrative-data typecheck
pnpm --filter @rpg/character-narrative-data lint
pnpm --filter @rpg/character-narrative-data test
```
