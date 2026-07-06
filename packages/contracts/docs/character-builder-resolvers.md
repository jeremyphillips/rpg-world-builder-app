# Character builder resolvers

Canonical catalog of resolver and assembly modules for the character builder engine.
The public import surface is `character-builder/resolvers/index.ts` (three exports);
this document tracks the full internal layout, status, and promotion path.

**Layer boundaries and naming:** [runtime-resolution-boundaries.md](runtime-resolution-boundaries.md)

## Public API (`resolvers/index.ts`)

| Export                       | Module                         | Purpose                                                                      |
| ---------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| `resolveAvailableContent`    | `resolve-available-content.ts` | Filters species, classes, spells, and equipment by character-creation rules. |
| `resolveAvailableChoices`    | `resolve-choices.ts`           | Derives pending `ChoiceSet[]` from draft + catalog context.                  |
| `resolveSpellcastingProfile` | `spellcasting-profile.ts`      | Structural spellcasting facts for the Spells step; null for non-casters.     |

## Internal choice-source registry (`CHOICE_SOURCE_RESOLVERS`)

Ordered modules in `resolvers/choice-sources.ts`. Each entry has signature
`(draft, context, catalogIndex) => ChoiceSet[]`. `resolveAvailableChoices`
concatenates results.

Registry entries are **thin adapters** (`resolve-*-choices.ts`) that delegate to
**implementation modules** (`resolve-*-choice-sets.ts`). See
`resolve-ruleset-language-choices.ts` → `resolve-language-choice-sets.ts`.

| Entry (adapter)                   | Implementation module                        | Status                      | Emits                                                                                                                       |
| --------------------------------- | -------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `resolveRulesetLanguageChoices`   | `resolve-language-choice-sets.ts`            | **Implemented**             | Ruleset origin language picks (`language`).                                                                                 |
| `resolveSpeciesHeritageChoices`   | `resolve-species-heritage-choice-sets.ts`    | **Implemented**             | Heritage `trait` ChoiceSet when species has `heritage`.                                                                     |
| `resolveSpeciesTraitGrantChoices` | `resolve-species-trait-grant-choice-sets.ts` | **Implemented**             | L1 trait grants via `resolveGrantGroupsFromContent` + `getUnlockedGrantsAtLevel`; includes selected heritage option grants. |
| `resolveClassSkillChoices`        | `resolve-class-skill-choice-sets.ts`         | **Implemented**             | Class `proficiencies.skills` pick (`skillProficiency`).                                                                     |
| `resolveClassFeatureGrantChoices` | `resolve-class-feature-grant-choice-sets.ts` | **Implemented**             | L1 class feature grants (feat/proficiency/equipment/language choices).                                                      |
| `resolveStartingEquipmentChoices` | `resolve-starting-equipment-choice-sets.ts`  | **Implemented** (BENCH-088) | Starting-equipment package picks.                                                                                           |
| `resolveSpellcastingChoices`      | `resolve-spellcasting-choice-sets.ts`        | **Implemented** (BENCH-089) | Cantrip and prepared-spell ChoiceSets.                                                                                      |

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

## Builder orchestration (`character-builder/assemble-*.ts`)

Finalize and preview call these modules after `resolveAvailableChoices`. Each
composes creature primitives, draft selections, and character assembly with
`CharacterSelectionSource` provenance.

| Module                               | Domain             | Called from                           |
| ------------------------------------ | ------------------ | ------------------------------------- |
| `assemble-language-proficiencies.ts` | Languages          | `assemble-proficiencies.ts`, finalize |
| `assemble-skill-proficiencies.ts`    | Skills             | `assemble-proficiencies.ts`           |
| `assemble-starting-equipment.ts`     | Equipment + wealth | `finalize.ts`, `preview.ts`           |
| `assemble-spellcasting.ts`           | Spells             | `finalize.ts`                         |
| `assemble-proficiencies.ts`          | Aggregate          | `finalize.ts`, `preview-adapter.ts`   |

## Creature primitives (`runtime/creature/`)

Promoted catalog/grant expansion reused across builder, NPC, and future monster surfaces.
Import via `runtime/creature/` modules or the `creature/index.ts` barrel.

| Module            | Exports (examples)                                                   | Consumed by                                     |
| ----------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `languages.ts`    | `resolveLanguagesFromChoiceSource`, `resolveLanguageIdsFromGrantSet` | Language ChoiceSets, finalize, grant ChoiceSets |
| `equipment.ts`    | `listEquipmentMatchingPool`, `toEquipmentContentId`                  | Equipment pool options, starting equipment      |
| `spellcasting.ts` | `cantripsKnownAtLevel`, `maxSelectableSpellLevel`                    | `spellcasting-profile.ts`                       |

### Promotion backlog

| Candidate                     | Disposition                                                                    |
| ----------------------------- | ------------------------------------------------------------------------------ |
| `creature/proficiencies.ts`   | Deferred — filtered `any` skill/weapon/tool pools need finalize assembly first |
| `resolvers/grants/` subfolder | Not needed — flat `resolvers/` remains navigable after refactor                |

## Deferred / folded resolvers

| Resolver                      | Disposition                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| `resolveSpellPickerItems`     | BENCH-105 — spell picker row state; blocked on BENCH-089       |
| `resolveAvailableFeats`       | Deferred — no full feat catalog in `CharacterBuildCatalog` yet |
| Campaign allow/deny filtering | Plugs into `resolveAvailableContent` when campaign scope ships |

## Related helpers

| Helper                              | Location                                  | Purpose                                                  |
| ----------------------------------- | ----------------------------------------- | -------------------------------------------------------- |
| `contentGrantToChoiceSets`          | `resolvers/grant-choice-sets.ts`          | Maps atomic `ContentGrant` choice shapes to `ChoiceSet`. |
| `unlockedGrantChoiceSets`           | `resolvers/unlocked-grant-choice-sets.ts` | Shared grant-group walk for traits and features.         |
| `resolveEquipmentPoolChoiceOptions` | `resolvers/equipment-pool-options.ts`     | Maps creature pool rows to `ChoiceSetOption[]`.          |
| `indexCharacterBuildCatalog`        | `context.ts`                              | Builds by-id lookup maps for resolver consumption.       |
