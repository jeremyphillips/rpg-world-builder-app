# Character builder resolvers

Canonical catalog of resolver and assembly modules for the character builder engine.
The public import surface is `character-builder/index.ts` (re-exported via `@rpg/contracts`);
this document tracks the full internal layout, status, and promotion path.

**Layer boundaries and naming:** [runtime-resolution-boundaries.md](runtime-resolution-boundaries.md)

## Public API

| Export                                       | Module                                                                  | Purpose                                                                                                                                                                                                                                                                                                                                     |
| -------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resolveAvailableContent`                    | `resolve-available-content.ts` (builder root)                           | Filters species, classes, spells, and equipment by character-creation rules.                                                                                                                                                                                                                                                                |
| `resolveAvailableChoices`                    | `resolvers/registry/resolve-choices.ts`                                 | Derives pending `ChoiceSet[]` from draft + catalog context.                                                                                                                                                                                                                                                                                 |
| `resolveSpellcastingProfile`                 | `resolvers/spellcasting/spellcasting-profile.ts`                        | Structural spellcasting facts for the Spells step; null for non-casters.                                                                                                                                                                                                                                                                    |
| `resolveSpellStepApplicability`              | `resolvers/spellcasting/resolve-spell-step-applicability.ts`            | Spells-step blocked / notApplicable / applicable gate before choice checks.                                                                                                                                                                                                                                                                 |
| `resolveBuilderStepReadiness`                | `step-readiness.ts`                                                     | Derived readiness for Equipment, Spells, and Proficiencies empty/default UI.                                                                                                                                                                                                                                                                |
| `resolveSpellPickerItems`                    | `resolvers/spellcasting/resolve-spell-picker-items.ts`                  | Enriches spell ChoiceSet options into picker rows (`compactSummary`, `searchText`, selection state) for the spell drawer.                                                                                                                                                                                                                   |
| `deriveEquipmentRecommendations`             | `resolvers/equipment/derive-equipment-recommendations.ts`               | Tiered picker recommendations (essential/strong/compatible/neutral/notRecommended) with reasons; inference from `spellcasting.requiredGear` (essential, not level-gated), `focusKinds` (essential when spellcasting active, else strong), and `recommendedGear` (strong), plus authored `characterCreation.equipmentRecommendations` rules. |
| `deriveRecommendedLanguageIds`               | `resolvers/proficiency/derive-recommended-language-ids.ts`              | Species affinity ids intersected with a language ChoiceSet option pool.                                                                                                                                                                                                                                                                     |
| `deriveEquipmentDraftEntries`                | `resolvers/equipment/derive-equipment-draft-entries.ts`                 | Package items minus removals plus draft purchases with selection sources.                                                                                                                                                                                                                                                                   |
| `deriveEquipmentBudgetSummary`               | `resolvers/equipment/equipment-budget.ts`                               | Starting/spent/remaining wealth for the equipment picker.                                                                                                                                                                                                                                                                                   |
| `resolveEquipmentPickerItems`                | `resolvers/equipment/resolve-equipment-picker-items.ts`                 | Annotates equipment rows with picker state (`isAffordable` / `isWithinRemainingBudget`) + `searchText`; excludes kinds outside `EQUIPMENT_PICKER_SUPPORTED_KINDS`. Browse order: [content-ranking.md](character-builder/content-ranking.md).                                                                                                |
| `EQUIPMENT_PICKER_SUPPORTED_KINDS`           | `resolvers/picker/equipment-picker-supported-kinds.ts`                  | Allowlist of equipment kinds surfaced in the character builder picker (excludes vehicle + service).                                                                                                                                                                                                                                         |
| `resolveStartingEquipmentOptionSummaries`    | `resolvers/equipment/resolve-starting-equipment-option-summaries.ts`    | Package option card enrichment for the Equipment step.                                                                                                                                                                                                                                                                                      |
| `resolveProficiencyLinkedEquipmentGrant`     | `resolvers/equipment/resolve-proficiency-linked-equipment-grant.ts`     | Resolves `target.proficiency_choice` grants from proficiency ChoiceSet answers (`pending` / `invalid` / `resolved`).                                                                                                                                                                                                                        |
| `getUnresolvedStartingEquipmentDependencies` | `resolvers/equipment/get-unresolved-starting-equipment-dependencies.ts` | Lists upstream proficiency ChoiceSets blocking equipment-step completion.                                                                                                                                                                                                                                                                   |
| `formatSelectionSourceLabel`                 | `runtime/character/format-selection-source-label.ts`                    | Shared provenance labels for equipment and proficiency rows (BENCH-118).                                                                                                                                                                                                                                                                    |
| `formatProficiencySourceLabel`               | `resolvers/proficiency/format-proficiency-source-label.ts`              | Thin wrapper over `formatSelectionSourceLabel` with proficiency `rowKind`.                                                                                                                                                                                                                                                                  |
| `formatSavingThrowProficiencyLabel`          | `resolvers/proficiency/format-saving-throw-proficiency-label.ts`        | Saving throw row label (`DEX · Dexterity`).                                                                                                                                                                                                                                                                                                 |
| `resolveProficiencyStepModel`                | `resolvers/proficiency/resolve-proficiency-step-model.ts`               | Sectioned grants + ChoiceSet summaries for the Proficiencies step.                                                                                                                                                                                                                                                                          |
| `resolveProficiencyPickerItems`              | `resolvers/proficiency/resolve-proficiency-picker-items.ts`             | Proficiency picker row state (granted overlap + selection full); optional `compactSummary` for `skillProficiency` rows.                                                                                                                                                                                                                     |
| `validateProficiencyChoiceSets`              | `validate/validate-choice-sets.ts`                                      | Stale proficiency selections (`proficiency_no_longer_available`).                                                                                                                                                                                                                                                                           |
| `evaluateEquipmentPackageSwitch`             | `equipment-package-switch.ts`                                           | Shared evaluator for package-switch preview, draft validation, and commit readiness (`noConflict` / `resolvable` / `blocked`).                                                                                                                                                                                                              |
| `buildEquipmentPackageSwitchPreview`         | `equipment-package-switch.ts`                                           | Thin wrapper: evaluator with committed purchase quantities.                                                                                                                                                                                                                                                                                 |
| `canSwitchEquipmentPackage`                  | `equipment-package-switch.ts`                                           | Thin wrapper: `noConflict` or resolvable draft within target allowance.                                                                                                                                                                                                                                                                     |
| `buildEquipmentPackageSwitchPatch`           | `equipment-package-switch.ts`                                           | Re-evaluates with `committedInventorySnapshot`; atomic selection + purchase patch or structured `commitError`.                                                                                                                                                                                                                              |
| `buildStartingPackageConversionPreview`      | `starting-package-conversion.ts`                                        | Preview package→gold conversion rows and eligibility before commit.                                                                                                                                                                                                                                                                         |
| `resolveEquipmentStepModel`                  | `resolvers/equipment/resolve-equipment-step-model.ts`                   | Unified equipment-step read model (readiness + funding + budget).                                                                                                                                                                                                                                                                           |
| `applyEquipmentStepAction`                   | `resolvers/equipment/apply-equipment-step-action.ts`                    | Canonical equipment-step draft mutations (Phase C complete).                                                                                                                                                                                                                                                                                |
| `clampEquipmentPurchaseQuantity`             | `resolvers/equipment/resolve-equipment-purchase-quantity-limits.ts`     | Budget/cap clamp for purchase quantity edits.                                                                                                                                                                                                                                                                                               |

## Equipment step command API (Phase B)

Canonical runtime entry points for equipment-step orchestration. Dashboard should
dispatch `EquipmentStepAction` values through `applyEquipmentStepAction` instead of
re-implementing draft mutations in `equipment-step.lib.ts`.

### Types

| Type                              | Module                                                | Purpose                                                                                                       |
| --------------------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `EquipmentStepUnavailableReason`  | `equipment-step-unavailable.ts`                       | Typed missing-context surface (`class_missing`, `choice_sets_loading`, …).                                    |
| `EquipmentStepAction`             | `equipment-step-action.ts`                            | Discriminated union of step mutations — all domain mutations dispatch here.                                   |
| `EquipmentStepActionResult`       | `equipment-step-action.ts`                            | Structured domain output: `applied` \| `needs_resolution` \| `blocked` \| `invalid` — no user-facing strings. |
| `EquipmentStepRemoveTarget`       | `equipment-step-action.ts`                            | Inventory row removal target (`package` \| `purchase` \| `magicItemGrant`).                                   |
| `EquipmentStepModel`              | `resolvers/equipment/resolve-equipment-step-model.ts` | Unified read model: `readiness`, funding snapshots, optional `budget`.                                        |
| `ResolveEquipmentStepModelResult` | `resolve-equipment-step-model.ts`                     | `{ status: 'available', model }` or `{ status: 'unavailable', reason }`.                                      |

### Entry points

```typescript
resolveEquipmentStepModel({
  draft,
  catalogIndex,
  context,
  resolvedChoiceSets, // null → choice_sets_loading
  startingWealth?,
  includeBudget?,
}): ResolveEquipmentStepModelResult

applyEquipmentStepAction({
  draft,
  catalogIndex,
  action,
  budget?,
  acquisitionContext?,
}): EquipmentStepActionResult
```

Readiness is resolved inside `resolveEquipmentStepModel` — do not call
`resolveEquipmentStepReadiness` in parallel when the model is available.

### Phase C — equipment step actions

All domain mutations dispatch through `applyEquipmentStepAction`:

| Action kind                | Replaces (deleted dashboard helpers)     |
| -------------------------- | ---------------------------------------- |
| `skip_starting_equipment`  | `buildEquipmentSkipPatch`                |
| `select_package`           | `buildEquipmentSelectionPatch`           |
| `add_purchase`             | `buildEquipmentAddPurchasePatch`         |
| `remove_entry`             | `buildEquipmentRemoveEntryPatch`         |
| `set_purchase_quantity`    | `buildEquipmentSetPurchaseQuantityPatch` |
| `remove_purchase_quantity` | `buildMagicItemPurchaseRemovalPatch`     |
| `acquire_magic_item`       | `buildMagicItemAcquisitionPatch`         |
| `apply_purchase_intent`    | `buildEquipmentPurchaseIntentPatch`      |
| `release_magic_item_grant` | `buildMagicItemGrantReleasePatch`        |

Dashboard hooks (`use-equipment-step`, `use-equipment-picker-acquisition`) apply
patches from `{ status: 'applied' }` results only. Package-switch commits remain in
`equipment-package-switch.ts` until folded into `resolve_package_switch`.

### Package-switch presentation boundary

`equipment-package-switch-resolution.lib.ts` (dashboard) **only adapts** contracts
evaluator output:

- Copy: titles, descriptions, blocking-reason messages, stale-inventory notice
- View models: row grouping, budget status labels, staged-removal chrome

Domain rules live in `evaluateEquipmentPackageSwitch` and
`buildEquipmentPackageSwitchPatch` — the dashboard module does not re-evaluate switch
eligibility independently.

## Directory layout

```text
character-builder/
  resolve-available-content.ts   catalog scope filter (not a ChoiceSourceResolver)
  step-readiness.ts              derived empty/default state for advanced steps (BENCH-120)
  step-readiness-helpers.ts      choice-set filtering + message formatting for readiness
  assembly/                      finalize orchestration (assemble-*.ts)
  validate/                      draft/step validation by phase
  resolvers/
    registry/     choice-sources, resolve-choices, choice-source-resolver
    grants/       grant-choice-sets, unlocked-grant-choice-sets
    ruleset/      language ChoiceSets
    species/      heritage + trait grant ChoiceSets
    class/        skill + feature grant ChoiceSets
    equipment/    starting equipment + pool choice options + step readiness
    spellcasting/ spellcasting profile + cantrip/spell ChoiceSets + step readiness
    proficiency/  proficiencies step view model + picker items + step readiness (BENCH-115)
```

## Builder step readiness (BENCH-120)

Derived **empty/default** state for the Equipment, Spells, and Proficiencies steps.
Readiness guides step-body copy and dashboard rail affordances; it does **not**
replace `validateCharacterBuild` or `isBuilderStepComplete`.

### Types

| Type                        | Values / fields                                                                                                |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `BuilderStepReadiness`      | `blocked` · `notApplicable` · `readyEmpty` · `readyWithChoices` · `complete`                                   |
| `BuilderStepReadinessState` | `readiness`, optional `message` / `helperText`, optional `classDependentBlocked` (proficiencies partial block) |

### Entry point

```typescript
resolveBuilderStepReadiness(
  stepId: 'proficiencies' | 'equipment' | 'spells',
  draft,
  context,
  resolvedChoiceSets,
): BuilderStepReadinessState
```

Delegates to `resolveEquipmentStepReadiness`, `resolveSpellsStepReadiness`
(uses `resolveSpellStepApplicability` first), and `resolveProficienciesStepReadiness`.

### Semantics (summary)

| Readiness          | Meaning                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------ |
| `blocked`          | Upstream choice missing (no class). Proficiencies: partial — origin languages still apply. |
| `notApplicable`    | Dependencies met; step does not apply (non-caster, inactive spellcasting).                 |
| `readyEmpty`       | Applicable; nothing to pick (e.g. class with no starting equipment ChoiceSets).            |
| `readyWithChoices` | Unresolved editable choices — render full step UI.                                         |
| `complete`         | Required choices satisfied, or skip/empty complete path.                                   |

User-facing copy lives in `characterBuilderStepReadinessMessages`
(`character-builder-messages.ts`) under `validation.characterBuilder.readiness.*`.
Section-level proficiency choice empty copy uses
`characterBuilderProficiencyChoiceEmptyMessages` and
`formatProficiencyChoiceEmptyMessage(choiceType)`.

### Dashboard rail mapping

Implemented in `apps/dashboard/.../builder-step-visual-status.ts` when
`resolvedChoiceSets !== null`:

| Readiness          | Rail `StepStatus`                               | Aria label note  |
| ------------------ | ----------------------------------------------- | ---------------- |
| `blocked`          | `notStarted` (or `current` when step is active) | —                |
| `notApplicable`    | `locked`                                        | "not applicable" |
| `readyEmpty`       | `complete`                                      | —                |
| `readyWithChoices` | existing completion / current logic             | —                |
| `complete`         | `complete`                                      | —                |

Step bodies render `BuilderStepReadinessPanel` from readiness `message` /
`helperText`:

- Full-block (`blocked` without `classDependentBlocked`): muted empty-state copy
- Partial-block proficiencies (`classDependentBlocked`): info inline notice;
  origin-language choices remain visible; class-dependent sections stay hidden

## Picker compact summaries

Collapsed catalog picker headers use **resolver-owned compact summaries** in
`@rpg/contracts`. Dashboard maps those objects to structured `metadataLines` via
`apps/dashboard/.../picker/catalog-picker-metadata/` (presentation only — badge
tone, segment layout). Do not rebuild summaries from raw catalog entities in UI.

| Domain    | Builder                               | Resolver field    | Contracts module                                                                 |
| --------- | ------------------------------------- | ----------------- | -------------------------------------------------------------------------------- |
| Equipment | `buildEquipmentCompactSummary`        | (view model)      | `content/lib/equipment-compact-display.ts` — `comparisonGroups`                  |
| Spells    | `buildSpellPickerCompactSummary`      | `compactSummary`  | `resolvers/spellcasting/format-spell-picker-metadata.ts`                         |
| Skills    | `buildSkillProficiencyCompactSummary` | `compactSummary?` | `content/lib/skill-proficiency-compact-display.ts` (skill proficiency rows only) |

Spell `castingSummary` includes concentration phrasing when applicable; the spell
drawer omits the redundant `Concentration` footer marker when that phrasing is
present (ritual markers unchanged).

## Internal choice-source registry (`CHOICE_SOURCE_RESOLVERS`)

Ordered modules in `resolvers/registry/choice-sources.ts`. Each entry has signature
`(draft, context, catalogIndex) => ChoiceSet[]`. `resolveAvailableChoices`
concatenates results.

Registry entries are **thin adapters** (`resolve-*-choices.ts`) that delegate to
**implementation modules** (`resolve-*-choice-sets.ts`). See
`ruleset/resolve-ruleset-language-choices.ts` → `ruleset/resolve-language-choice-sets.ts`.

| Entry (adapter)                   | Folder          | Implementation module                        | Status                      | Emits                                                                                                                              |
| --------------------------------- | --------------- | -------------------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `resolveRulesetLanguageChoices`   | `ruleset/`      | `resolve-language-choice-sets.ts`            | **Implemented**             | Ruleset origin language picks (`language`).                                                                                        |
| `resolveSpeciesHeritageChoices`   | `species/`      | `resolve-species-heritage-choice-sets.ts`    | **Implemented**             | Heritage `trait` ChoiceSet when species has `heritage`.                                                                            |
| `resolveSpeciesTraitGrantChoices` | `species/`      | `resolve-species-trait-grant-choice-sets.ts` | **Implemented**             | L1 trait grants via `resolveGrantGroupsFromContent` + `getUnlockedGrantsAtLevel`; includes selected heritage option grants.        |
| `resolveClassSkillChoices`        | `class/`        | `resolve-class-skill-choice-sets.ts`         | **Implemented**             | Class `proficiencies.skills` pick (`skillProficiency`).                                                                            |
| `resolveClassToolChoices`         | `class/`        | `resolve-class-tool-choice-sets.ts`          | **Implemented** (BENCH-116) | Class `characterCreation.proficiencies.tools` pick (`toolProficiency`) via `ToolProficiencyPool` + `resolveToolPoolChoiceOptions`. |
| `resolveClassFeatureGrantChoices` | `class/`        | `resolve-class-feature-grant-choice-sets.ts` | **Implemented**             | L1 class feature grants (feat/proficiency/equipment/language choices).                                                             |
| `resolveStartingEquipmentChoices` | `equipment/`    | `resolve-starting-equipment-choice-sets.ts`  | **Implemented** (BENCH-088) | Starting-equipment package picks.                                                                                                  |
| `resolveSpellcastingChoices`      | `spellcasting/` | `resolve-spellcasting-choice-sets.ts`        | **Implemented** (BENCH-089) | Cantrip and prepared-spell ChoiceSets.                                                                                             |

### Grant traversal contract

All trait and feature grant walkers **must** use:

```typescript
const groups = resolveGrantGroupsFromContent(content, parentUnlock)
const grants = getUnlockedGrantsAtLevel(groups, level, parentLevel)
```

Resolvers never read the deprecated `grants` bag directly.

### Level-1 seed choice shapes (BENCH-086 inventory)

| Shape key                   | Resolver                                                                         |
| --------------------------- | -------------------------------------------------------------------------------- |
| `heritage`                  | `resolveSpeciesHeritageChoices`                                                  |
| `classSkills:choose:from`   | `resolveClassSkillChoices`                                                       |
| `classTools:choose:pool`    | `resolveClassToolChoices` (legacy `from[]` normalized to explicit pool on parse) |
| `featChoice:origin`         | `resolveSpeciesTraitGrantChoices` (`required: false` — MVP defers feat UI)       |
| `featChoice:fighting-style` | `resolveClassFeatureGrantChoices` (`required: false`)                            |
| `starting-equipment`        | `resolveStartingEquipmentChoices`                                                |
| `equipment:filtered:tool`   | `resolveStartingEquipmentChoices` (nested package pick)                          |
| `grant:proficiency_choice`  | No nested ChoiceSet — `resolveProficiencyLinkedEquipmentGrant` at assembly time  |
| `damageType:heritage`       | Not a top-level ChoiceSet — applied when heritage option is selected             |

## Builder orchestration (`character-builder/assembly/`)

Finalize and preview call these modules after `resolveAvailableChoices`. Each
composes creature primitives, draft selections, and character assembly with
`CharacterSelectionSource` provenance.

| Module                                         | Domain                                                                                                                                                                                 | Called from                           |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| `assembly/assemble-language-proficiencies.ts`  | Languages (ruleset grants, origin ChoiceSet picks, class-feature fixed `languages` grants)                                                                                             | `assemble-proficiencies.ts`, finalize |
| `assembly/assemble-skill-proficiencies.ts`     | Skills (class-fixed, grant-derived, ChoiceSet picks)                                                                                                                                   | `assemble-proficiencies.ts`           |
| `assembly/assemble-tool-proficiencies.ts`      | Tools (class-fixed, grant-derived, ChoiceSet picks)                                                                                                                                    | `assemble-proficiencies.ts`           |
| `assembly/assemble-weapon-proficiencies.ts`    | Weapons (class-fixed, grant-derived, ChoiceSet picks)                                                                                                                                  | `assemble-proficiencies.ts`           |
| `assembly/assemble-armor-proficiencies.ts`     | Armor (class-fixed, grant-derived, ChoiceSet picks)                                                                                                                                    | `assemble-proficiencies.ts`           |
| `assembly/assemble-grant-proficiencies.ts`     | Fixed grant rows from species traits, heritage, and class features                                                                                                                     | domain `assemble-*-proficiencies.ts`  |
| `assembly/collect-sourced-grants.ts`           | Unlocked grant walk with provenance                                                                                                                                                    | `assemble-grant-proficiencies.ts`     |
| `assembly/selection-source-from-choice-set.ts` | ChoiceSet source metadata → `CharacterSelectionSource`                                                                                                                                 | domain `assemble-*-proficiencies.ts`  |
| `mergeSkillProficiencyEntries`                 | Skills (dedupe)                                                                                                                                                                        | `assemble-skill-proficiencies.ts`     |
| `mergeToolProficiencyEntries`                  | Tools (dedupe)                                                                                                                                                                         | `assemble-tool-proficiencies.ts`      |
| `mergeWeaponProficiencyEntries`                | Weapons (dedupe)                                                                                                                                                                       | `assemble-weapon-proficiencies.ts`    |
| `mergeArmorProficiencyEntries`                 | Armor (dedupe)                                                                                                                                                                         | `assemble-armor-proficiencies.ts`     |
| `assembly/assemble-starting-equipment.ts`      | Equipment + wealth (`target.proficiency_choice` grants resolve from proficiency answers; see [equipment-proficiency-patterns.md](character-builder-equipment-proficiency-patterns.md)) | `finalize.ts`, `preview.ts`           |
| `assembly/assemble-spellcasting.ts`            | Spells                                                                                                                                                                                 | `finalize.ts`                         |
| `assembly/assemble-proficiencies.ts`           | Aggregate                                                                                                                                                                              | `finalize.ts`, `preview-adapter.ts`   |

`assemble-language-proficiencies.ts` merges three language sources at finalize:

1. Ruleset automatic grants (e.g. Common via `proficiencyGrants.languages`)
2. Draft selections from language ChoiceSets (e.g. origin languages)
3. Fixed `languages` grants from unlocked class features (e.g. Druidic on the Druid class)

Species trait / heritage fixed language grants remain follow-on work. Grant-derived
skill/weapon/tool/armor proficiencies finalize via `assemble-grant-proficiencies.ts`
and domain `assemble-*-proficiencies.ts` modules (BENCH-117).

## Creature primitives (`runtime/creature/`)

Promoted catalog/grant expansion reused across builder, NPC, and future monster surfaces.
Import via `runtime/creature/` modules or the `creature/index.ts` barrel.

| Module             | Exports (examples)                                                                                                          | Consumed by                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `languages.ts`     | `resolveLanguagesFromChoiceSource`, `resolveLanguageIdsFromGrantSet`                                                        | Language ChoiceSets, finalize, grant ChoiceSets |
| `proficiencies.ts` | `listSkillsMatchingPool`, `listWeaponsMatchingPool`, `listToolsMatchingPool`, `listArmorMatchingPool`, `*PoolChoiceOptions` | Grant proficiency ChoiceSets, finalize          |
| `equipment.ts`     | `listEquipmentMatchingPool`, `toEquipmentContentId`                                                                         | Equipment pool options, starting equipment      |
| `spellcasting.ts`  | `cantripsKnownAtLevel`, `maxSelectableSpellLevel`                                                                           | `spellcasting-profile.ts`                       |

### Promotion backlog

| Candidate         | Disposition                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------- |
| `validate/` split | Done — `types`, `issue`, `validate-step-fields`, `validate-choice-sets`, `validate-character-build` |

## Deferred / folded resolvers

| Resolver                                  | Disposition                                                          |
| ----------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `resolveSpellPickerItems`                 | `resolvers/spellcasting/resolve-spell-picker-items.ts`               | **Implemented** (BENCH-105) — spell picker row state + `compactSummary` (built once in resolver)                                                                                      |
| `resolveProficiencyStepModel`             | `resolvers/proficiency/resolve-proficiency-step-model.ts`            | **Implemented** (BENCH-115) — proficiencies step view model                                                                                                                           |
| `resolveProficiencyPickerItems`           | `resolvers/proficiency/resolve-proficiency-picker-items.ts`          | **Implemented** (BENCH-115) — proficiency picker row state; skill rows include `compactSummary`                                                                                       |
| `deriveEquipmentRecommendations`          | `resolvers/equipment/derive-equipment-recommendations.ts`            | **Implemented** — tiered recommendations; supersedes BENCH-095 boolean recommendation                                                                                                 |
| `isToolProficient`                        | `runtime/creature/proficiencies.ts`                                  | Creature-level tool proficiency predicate (`toolId` slug/id or `toolCategory` match)                                                                                                  |
| `deriveRecommendedLanguageIds`            | `resolvers/proficiency/derive-recommended-language-ids.ts`           | **Implemented** — species `languageAffinities ∩` ChoiceSet options; never expands pool                                                                                                |
| `resolveEquipmentPickerItems`             | `resolvers/equipment/resolve-equipment-picker-items.ts`              | **Implemented** (BENCH-095) — picker row state (`isAffordable` / `isWithinRemainingBudget`) + search text; browse order in [content-ranking.md](character-builder/content-ranking.md) |
| `resolveStartingEquipmentOptionSummaries` | `resolvers/equipment/resolve-starting-equipment-option-summaries.ts` | **Implemented** (BENCH-095) — starting package card summaries                                                                                                                         |
| `resolveAvailableFeats`                   | Deferred — no full feat catalog in `CharacterBuildCatalog` yet       |
| Campaign allow/deny filtering             | Plugs into `resolveAvailableContent` when campaign scope ships       |

## Related helpers

| Helper                                | Location                                                 | Purpose                                                  |
| ------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------- |
| `contentGrantToChoiceSets`            | `resolvers/grants/grant-choice-sets.ts`                  | Maps atomic `ContentGrant` choice shapes to `ChoiceSet`. |
| `unlockedGrantChoiceSets`             | `resolvers/grants/unlocked-grant-choice-sets.ts`         | Shared grant-group walk for traits and features.         |
| `resolveEquipmentPoolChoiceOptions`   | `resolvers/equipment/equipment-pool-choice-options.ts`   | Maps creature pool rows to `ChoiceSetOption[]`.          |
| `indexCharacterBuildCatalog`          | `context.ts`                                             | Builds by-id lookup maps for resolver consumption.       |
| `buildEquipmentCompactSummary`        | `content/lib/equipment-compact-display.ts`               | Equipment picker `comparisonGroups` + `kindLabel`.       |
| `buildSpellPickerCompactSummary`      | `resolvers/spellcasting/format-spell-picker-metadata.ts` | Spell picker `castingSummary` + `classification`.        |
| `buildSkillProficiencyCompactSummary` | `content/lib/skill-proficiency-compact-display.ts`       | Skill proficiency ability label + catalog `exampleUses`. |
