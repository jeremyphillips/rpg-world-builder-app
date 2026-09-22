# @rpg/character-narrative-integrations

Character-builder integration for narrative generation.

This package translates a `CharacterBuilderDraft` and `CharacterBuildContext`
into the small, reference-safe context consumed by
`@rpg/character-narrative-core`. It resolves selected playable organizations,
residences supplied by the caller, class, species, heritage, culture, and
character kind without exposing unrelated catalog data to the generator.

## Responsibilities

- Project builder state into `NarrativeGenerationContext`.
- Preserve alignment as the strongest compatibility constraint.
- Use only selected and playable organization references.
- Resolve residence connections only when the caller supplies the authorized location list.
- Record selected references that could not be resolved in `omittedReferenceIds`.
- Load the authored collection lazily and delegate pure composition to the core package.

This package does not mutate drafts, create relationships, or persist generation
metadata. The dashboard owns form state, empty-field preservation, rich-text
conversion, pending state, and stale-result handling.

## Public API

```ts
import {
  buildNarrativeContext,
  generateCharacterNarrative,
} from '@rpg/character-narrative-integrations'

const context = buildNarrativeContext({ draft, context: buildContext, locations })
const result = await generateCharacterNarrative(context, seed)
```

`locations` is intentionally caller-supplied. Dashboard code loads locations
through its existing authorized content API and passes those rows only when the
character is in a campaign scope.

## Commands

```bash
pnpm --filter @rpg/character-narrative-integrations typecheck
pnpm --filter @rpg/character-narrative-integrations lint
pnpm --filter @rpg/character-narrative-integrations test
```
