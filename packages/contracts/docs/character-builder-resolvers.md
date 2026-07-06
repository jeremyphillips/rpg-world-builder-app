# Character builder resolvers

Canonical catalog of resolver functions for the character builder engine. The
public import surface is `character-builder/resolvers/index.ts`; this document
tracks status, purpose, and promotion path for each resolver.

## Public API

| Resolver                  | Status                      | Purpose                                                                      |
| ------------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| `resolveAvailableContent` | **Implemented** (BENCH-081) | Filters species, classes, spells, and equipment by character-creation rules. |
| `resolveAvailableChoices` | **Implemented** (BENCH-087) | Derives pending `ChoiceSet[]` from draft + catalog context.                  |

## Internal choice-source registry (`CHOICE_SOURCE_RESOLVERS`)

Ordered modules in `resolvers/choice-sources.ts`. Each entry has signature
`(draft, context, catalogIndex) => ChoiceSet[]`. `resolveAvailableChoices`
concatenates results.

| Entry                             | Status                      | Emits                                                                                                                       |
| --------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `resolveSpeciesHeritageChoices`   | **Implemented**             | Heritage `trait` ChoiceSet when species has `heritage`.                                                                     |
| `resolveSpeciesTraitGrantChoices` | **Implemented**             | L1 trait grants via `resolveGrantGroupsFromContent` + `getUnlockedGrantsAtLevel`; includes selected heritage option grants. |
| `resolveClassSkillChoices`        | **Implemented**             | Class `proficiencies.skills` pick (`skillProficiency`).                                                                     |
| `resolveClassFeatureGrantChoices` | **Implemented**             | L1 class feature grants (feat/proficiency/equipment/language choices).                                                      |
| `resolveStartingEquipmentChoices` | **Implemented** (BENCH-088) | Starting-equipment package picks.                                                                                           |
| `resolveSpellcastingChoices`      | **Deferred** (BENCH-089)    | Cantrip and spell known/prepared ChoiceSets.                                                                                |

### Grant traversal contract

All trait and feature grant walkers **must** use:

```typescript
const groups = resolveGrantGroupsFromContent(content, parentUnlock)
const grants = getUnlockedGrantsAtLevel(groups, level, parentLevel)
```

Resolvers never read the deprecated `grants` bag directly.

### Level-1 seed choice shapes (BENCH-086 inventory)

| Shape key                   | Resolver                                                                   |
| --------------------------- | -------------------------------------------------------------------------- |
| `heritage`                  | `resolveSpeciesHeritageChoices`                                            |
| `classSkills:choose:from`   | `resolveClassSkillChoices`                                                 |
| `featChoice:origin`         | `resolveSpeciesTraitGrantChoices` (`required: false` — MVP defers feat UI) |
| `featChoice:fighting-style` | `resolveClassFeatureGrantChoices` (`required: false`)                      |
| `starting-equipment`        | `resolveStartingEquipmentChoices`                                          |
| `equipment:filtered:tool`   | `resolveStartingEquipmentChoices` (nested package pick)                    |
| `damageType:heritage`       | Not a top-level ChoiceSet — applied when heritage option is selected       |

## Deferred / folded resolvers

| Resolver                      | Disposition                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| `resolveSpellcastingProfile`  | BENCH-089 — exported when spell step ships                     |
| `resolveAvailableFeats`       | Deferred — no full feat catalog in `CharacterBuildCatalog` yet |
| Campaign allow/deny filtering | Plugs into `resolveAvailableContent` when campaign scope ships |

## Related helpers

| Helper                       | Location                                  | Purpose                                                  |
| ---------------------------- | ----------------------------------------- | -------------------------------------------------------- |
| `contentGrantToChoiceSets`   | `resolvers/grant-choice-sets.ts`          | Maps atomic `ContentGrant` choice shapes to `ChoiceSet`. |
| `unlockedGrantChoiceSets`    | `resolvers/unlocked-grant-choice-sets.ts` | Shared grant-group walk for traits and features.         |
| `indexCharacterBuildCatalog` | `context.ts`                              | Builds by-id lookup maps for resolver consumption.       |
