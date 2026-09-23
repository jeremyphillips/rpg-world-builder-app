# @rpg/character-narrative-integrations

Character-builder integration for narrative generation.

This package translates a `CharacterBuilderDraft` and `CharacterBuildContext`
into the small, reference-safe context consumed by
`@rpg/character-narrative-core`. It resolves selected playable organizations,
residences and places supplied by the caller, campaign characters for person
roles, class, species, heritage, culture, and character kind without exposing
unrelated catalog data to the generator.

## Responsibilities

- Project builder state into `NarrativeGenerationContext` and bounded
  `NarrativeRelationshipFacts`.
- Preserve alignment as the strongest compatibility constraint.
- Use only selected and playable organization references.
- Resolve location edges (`resides_at`, hometown, birthplace, property kinds)
  only when the caller supplies the authorized location list.
- Resolve person edges (mentor, child, partner, rival, parent) only when the
  caller supplies authorized campaign character rows.
- Record selected references that could not be resolved in `omittedReferenceIds`.
- Load the authored collection lazily and delegate pure composition to the core package.

This package does not mutate drafts, create relationships, or persist generation
metadata. The dashboard owns form state, empty-field preservation, rich-text
conversion, pending state, and stale-result handling. Visibility filtering for
hidden edges belongs at the integration boundary when persisted edges are added;
builder drafts are manager-authored campaign context.

## Public API

```ts
import {
  buildNarrativeContext,
  generateCharacterNarrative,
} from '@rpg/character-narrative-integrations'

const context = buildNarrativeContext({
  draft,
  context: buildContext,
  locations,
  characters,
})
const result = await generateCharacterNarrative(context, seed)
```

`locations` and `characters` are intentionally caller-supplied. Dashboard code
loads them through existing authorized campaign queries and passes those rows
only when the character is in a campaign scope.

## Commands

```bash
pnpm --filter @rpg/character-narrative-integrations typecheck
pnpm --filter @rpg/character-narrative-integrations lint
pnpm --filter @rpg/character-narrative-integrations test
```
