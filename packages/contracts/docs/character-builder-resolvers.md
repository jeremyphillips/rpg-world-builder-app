# Character builder resolvers

Canonical catalog of resolver and assembly modules for the character builder engine.
The public import surface is `character-builder/index.ts` (re-exported via `@rpg/contracts`);
this document tracks the full internal layout, status, and promotion path.

**Layer boundaries and naming:** [runtime-resolution-boundaries.md](runtime-resolution-boundaries.md)

## Public API

| Export                                    | Module                                                               | Purpose                                                                      |
| ----------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `resolveAvailableContent`                 | `resolve-available-content.ts` (builder root)                        | Filters species, classes, spells, and equipment by character-creation rules. |
| `resolveAvailableChoices`                 | `resolvers/registry/resolve-choices.ts`                              | Derives pending `ChoiceSet[]` from draft + catalog context.                  |
| `resolveSpellcastingProfile`              | `resolvers/spellcasting/spellcasting-profile.ts`                     | Structural spellcasting facts for the Spells step; null for non-casters.     |
| `resolveSpellPickerItems`                 | `resolvers/spellcasting/resolve-spell-picker-items.ts`               | Enriches spell ChoiceSet options into picker rows for the spell drawer.      |
| `deriveRecommendedEquipment`              | `resolvers/equipment/derive-recommended-equipment.ts`                | Recommended equipment ids for the picker Recommended tab.                    |
| `resolveEquipmentPickerItems`             | `resolvers/equipment/resolve-equipment-picker-items.ts`              | Annotates equipment rows with picker state + `searchText`.                   |
| `resolveStartingEquipmentOptionSummaries` | `resolvers/equipment/resolve-starting-equipment-option-summaries.ts` | Package option card enrichment for the Equipment step.                       |

## Directory layout

```text
character-builder/
  resolve-available-content.ts   catalog scope filter (not a ChoiceSourceResolver)
  assembly/                      finalize orchestration (assemble-*.ts)
  validate/                      draft/step validation by phase
  resolvers/
    registry/     choice-sources, resolve-choices, choice-source-resolver
    grants/       grant-choice-sets, unlocked-grant-choice-sets
    ruleset/      language ChoiceSets
    species/      heritage + trait grant ChoiceSets
    class/        skill + feature grant ChoiceSets
    equipment/    starting equipment + pool choice options
    spellcasting/ spellcasting profile + cantrip/spell ChoiceSets
```

## Internal choice-source registry (`CHOICE_SOURCE_RESOLVERS`)

Ordered modules in `resolvers/registry/choice-sources.ts`. Each entry has signature
`(draft, context, catalogIndex) => ChoiceSet[]`. `resolveAvailableChoices`
concatenates results.

Registry entries are **thin adapters** (`resolve-*-choices.ts`) that delegate to
**implementation modules** (`resolve-*-choice-sets.ts`). See
`ruleset/resolve-ruleset-language-choices.ts` → `ruleset/resolve-language-choice-sets.ts`.

| Entry (adapter)                   | Folder          | Implementation module                        | Status                      | Emits                                                                                                                       |
| --------------------------------- | --------------- | -------------------------------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `resolveRulesetLanguageChoices`   | `ruleset/`      | `resolve-language-choice-sets.ts`            | **Implemented**             | Ruleset origin language picks (`language`).                                                                                 |
| `resolveSpeciesHeritageChoices`   | `species/`      | `resolve-species-heritage-choice-sets.ts`    | **Implemented**             | Heritage `trait` ChoiceSet when species has `heritage`.                                                                     |
| `resolveSpeciesTraitGrantChoices` | `species/`      | `resolve-species-trait-grant-choice-sets.ts` | **Implemented**             | L1 trait grants via `resolveGrantGroupsFromContent` + `getUnlockedGrantsAtLevel`; includes selected heritage option grants. |
| `resolveClassSkillChoices`        | `class/`        | `resolve-class-skill-choice-sets.ts`         | **Implemented**             | Class `proficiencies.skills` pick (`skillProficiency`).                                                                     |
| `resolveClassFeatureGrantChoices` | `class/`        | `resolve-class-feature-grant-choice-sets.ts` | **Implemented**             | L1 class feature grants (feat/proficiency/equipment/language choices).                                                      |
| `resolveStartingEquipmentChoices` | `equipment/`    | `resolve-starting-equipment-choice-sets.ts`  | **Implemented** (BENCH-088) | Starting-equipment package picks.                                                                                           |
| `resolveSpellcastingChoices`      | `spellcasting/` | `resolve-spellcasting-choice-sets.ts`        | **Implemented** (BENCH-089) | Cantrip and prepared-spell ChoiceSets.                                                                                      |

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

## Builder orchestration (`character-builder/assembly/`)

Finalize and preview call these modules after `resolveAvailableChoices`. Each
composes creature primitives, draft selections, and character assembly with
`CharacterSelectionSource` provenance.

| Module                                        | Domain             | Called from                           |
| --------------------------------------------- | ------------------ | ------------------------------------- |
| `assembly/assemble-language-proficiencies.ts` | Languages          | `assemble-proficiencies.ts`, finalize |
| `assembly/assemble-skill-proficiencies.ts`    | Skills             | `assemble-proficiencies.ts`           |
| `assembly/assemble-starting-equipment.ts`     | Equipment + wealth | `finalize.ts`, `preview.ts`           |
| `assembly/assemble-spellcasting.ts`           | Spells             | `finalize.ts`                         |
| `assembly/assemble-proficiencies.ts`          | Aggregate          | `finalize.ts`, `preview-adapter.ts`   |

## Creature primitives (`runtime/creature/`)

Promoted catalog/grant expansion reused across builder, NPC, and future monster surfaces.
Import via `runtime/creature/` modules or the `creature/index.ts` barrel.

| Module            | Exports (examples)                                                   | Consumed by                                     |
| ----------------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `languages.ts`    | `resolveLanguagesFromChoiceSource`, `resolveLanguageIdsFromGrantSet` | Language ChoiceSets, finalize, grant ChoiceSets |
| `equipment.ts`    | `listEquipmentMatchingPool`, `toEquipmentContentId`                  | Equipment pool options, starting equipment      |
| `spellcasting.ts` | `cantripsKnownAtLevel`, `maxSelectableSpellLevel`                    | `spellcasting-profile.ts`                       |

### Promotion backlog

| Candidate                   | Disposition                                                                                         |
| --------------------------- | --------------------------------------------------------------------------------------------------- |
| `creature/proficiencies.ts` | Deferred — filtered `any` skill/weapon/tool pools need finalize assembly first                      |
| `validate/` split           | Done — `types`, `issue`, `validate-step-fields`, `validate-choice-sets`, `validate-character-build` |

## Deferred / folded resolvers

| Resolver                                  | Disposition                                                          |
| ----------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `resolveSpellPickerItems`                 | `resolvers/spellcasting/resolve-spell-picker-items.ts`               | **Implemented** (BENCH-105) — spell picker row state + metadata            |
| `deriveRecommendedEquipment`              | `resolvers/equipment/derive-recommended-equipment.ts`                | **Implemented** (BENCH-095) — package grants + proficient weapon/armor ids |
| `resolveEquipmentPickerItems`             | `resolvers/equipment/resolve-equipment-picker-items.ts`              | **Implemented** (BENCH-095) — equipment picker row state + search text     |
| `resolveStartingEquipmentOptionSummaries` | `resolvers/equipment/resolve-starting-equipment-option-summaries.ts` | **Implemented** (BENCH-095) — starting package card summaries              |
| `resolveAvailableFeats`                   | Deferred — no full feat catalog in `CharacterBuildCatalog` yet       |
| Campaign allow/deny filtering             | Plugs into `resolveAvailableContent` when campaign scope ships       |

## Related helpers

| Helper                              | Location                                               | Purpose                                                  |
| ----------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| `contentGrantToChoiceSets`          | `resolvers/grants/grant-choice-sets.ts`                | Maps atomic `ContentGrant` choice shapes to `ChoiceSet`. |
| `unlockedGrantChoiceSets`           | `resolvers/grants/unlocked-grant-choice-sets.ts`       | Shared grant-group walk for traits and features.         |
| `resolveEquipmentPoolChoiceOptions` | `resolvers/equipment/equipment-pool-choice-options.ts` | Maps creature pool rows to `ChoiceSetOption[]`.          |
| `indexCharacterBuildCatalog`        | `context.ts`                                           | Builds by-id lookup maps for resolver consumption.       |
