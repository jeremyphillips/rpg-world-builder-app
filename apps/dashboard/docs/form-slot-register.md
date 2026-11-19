# Form slot register

Phase 0 inventory for production `kind: 'slot'` declarations in the dashboard.
Evidence stages: code-analysis candidate, feasibility verified, parity tested,
approved, completed. Confidence: **V** verified, **C** conditional, **P** needs a
shared API change.

Recount after Phase 1 (production `*.ts` / `*.tsx` only, tests and stories
excluded): **100 static literals in 41 files**. Phase 0 started at 101.
`_editionPresetEffects` moved to `valueSyncs`. The audit plan's 103/41 figure
predates `formsShapeShifting` replacing separate true-form and forms-editor
slots. `locations/README.md` mentions `kind: 'slot'` in prose and is not a
declaration. The ratchet baseline is
`apps/dashboard/src/test/form-slot-literal-baseline.json`.

Stable identity is the source file plus the slot `name` literal, or the factory
function name when one literal serves many runtime rows.

## Baseline (static literals per file)

| File                                                                     | Literals |
| ------------------------------------------------------------------------ | -------: |
| `spells/resolution/lib/form/resolution-form-slots.ts`                    |       11 |
| `monsters/lib/monster-form-fields.tsx`                                   |        7 |
| `monsters/lib/actions/detail-fields/section-composers.tsx`               |        6 |
| `monsters/lib/creature-details/monster-creature-details-form-fields.tsx` |        5 |
| `monsters/lib/actions/detail-fields/shared-mechanics.tsx`                |        5 |
| `character/lib/steps/identity-form-fields.ts`                            |        5 |
| `character/lib/steps/abilities-form-fields.ts`                           |        5 |
| `campaign/.../character-configuration-form-fields.ts`                    |        5 |
| `lib/forms/organization-form-projection.ts`                              |        4 |
| `classes/lib/class-spellcasting-form-fields.ts`                          |        4 |
| `monsters/lib/traits/monster-trait-form-fields.tsx`                      |        3 |
| `monsters/lib/statistics/monster-armor-class-fields.tsx`                 |        3 |
| `monsters/lib/actions/detail-fields/save-authoring.tsx`                  |        3 |
| Remaining 28 files                                                       | 1–2 each |

`ownedSlot` in `monster-form-fields.tsx` is one factory covering five names:
`experiencePointsOverride`, `proficiencies.savingThrows`, `bonusActions`,
`reactions`, `legendaryActions`. Runtime multipliers (not extra identities):
`monsterFormAvailabilityField` (every restricted action/trait row),
`buildAdvisories` (action composers and trait rows), `_turnLimit`,
`castingAbility` variants, action previews, `_grantTypePersist` /
`_grantTypeMissingRepair`, `_effectId` / `_definition`, `_outcomeApplicationStatus`,
and `contentAvailabilitySlot` across content shells.

## Phase 0 findings

### Preview dependency proof of concept — fail

Subject: `attackPreview` (`MonsterActionAttackSummary`).

Inputs the builder actually uses:

- Whole form via `useWatch()` with no name.
- `findMonsterFormActionDraft` and `resolveMonsterFormActionAttackProfile` call
  `normalizeMonsterFormValues` on the full values object and locate the row by
  `action.id` across action sections, not by `namePrefix`.
- Normalized challenge rating (proficiency), ability scores, equipment catalog,
  magic-property provider, and `ctx.armorClassRules`.
- Title from `useMonsterActionPreviewTitle`, which watches `forms` and `name`.
- Catalog readiness lives on `ctx`, not on form values.

A declarative `dependsOn` plus pure `contentWhen` cannot express this without
subscribing to whole top-level sections (id search), reconstructing a near-complete
`MonsterFormValues`, and calling a hook for the title. **Previews stay slots.**
Display v1 launches with text and notice only. Future approaches, not
implemented: a per-row selector plus a narrow stat context, or a domain preview
context. Display must not grow a render callback to absorb this.

`parryPreview` is the same shape at smaller scale (own row, follow-up action by
id, `forms`, `ctx`). `traitPreview` and `shapeShiftSummary` are simpler but were
not assumed to pass.

### Display walker, placement, identity

`FormItem` walkers that switch on `kind` must add a `display` branch or they
silently drop the node. `assertNever` on the default is feasible only in
exhaustive switches; several walkers use `if (item.kind === 'slot')` and would
need an explicit branch. Column stacks may host display items because
`GroupFieldItem` is wider than `RowFieldItem`. `formItemKey` already keys on
`name` plus sibling index; a required `id` on display keeps reorder stable when
the block has no field name. Empty `contentWhen` results should render no DOM
so spacing does not reserve a blank row.

### Live region and text roles

Level-range summaries mount `<Text variant="muted" as="p" aria-live="polite">`
and unmount with the switch, so mount-with-content is not announced. Display
`text` with `live: 'polite'` matches that. `aria-atomic` is not required for
parity. Allowed roles from current text consumers: `supporting`, `caption`,
`muted`. `label` and `emphasis` stay excluded.

### `dependsOn`

Paths are relative to `namePrefix`. Each `../` pops one segment, including
indexes, and extra hops clamp to the root. That is enough for row-local fields.
Root-anchored paths are a clarity extension, not a blocker for text and notice
migrations. The forms.md `../` example should be corrected when that extension
lands.

### `ownedSlot` parity

The factory registers a `hostSlot` labeled with the raw path and owns the tab
prefix. It does not register the control or claim issues. Replacing it with tab
`errorPaths` covers the badge prefix only. Removing the host entry can change
footer copy from the raw path to the unlabeled fallback. **Stay C** until a
parity test compares badge counts, footer summary, and claim targets. Raw-path
labels are a copy defect candidate, not a migration by themselves.

### Extended progression

`_extendedProgressionEffects` writes on every dependency change, including
mount, and re-seeds `extendedMaxLevel` when the author clears it. `valueSyncs`
skip the first observation. **Do not promote** until a spike test matches
create, load, toggle, clear, standard-max change, reset, dirty state, and
`null` versus object serialization. Otherwise retain the slot.

### `_editionPresetEffects`

**Completed.** Replaced by `buildMechanicsValueSyncs()` on the mechanics
`<Form>`. The headless `EditionPresetEffects` slot is gone. Parity covers
initial load, a preset change, reset after save, and read-only fields.

### `_resolutionEffectsApplicationLabel`

Sits in a resolution group. `heading.hint.resolve` is valid only if that group
is the direct parent and the hint role matches. Otherwise it is a Phase 3a
display `text`. Stage stays conditional.

### `_mechanicsLeadCopy`

`PageHeader` does not take arbitrary supporting copy for this screen. Option B
(display `text`) is the feasible path. Copy must stay verbatim.

### Grant and effect registration

`_grantTypePersist`, `_effectId`, and
`_organizationMembershipTitlesRegistration` exist to keep values registered
while the visible control is absent. `valueSyncs` and `optionalDisclosure` do
not cover that. Hidden registration stays an independent decision gate. Fewer
than three consumers have a shared safe-path contract, so the default is retain.

### Chips value semantics

`optionalDisclosure` treats populated arrays as expanded. Species
`personalNameComponents` can use that if `undefined`, `[]`, and a non-empty
list stay distinct in the payload. Monster `omittedComponents` is a checkbox
group today. Moving it to chips is a presentation change and needs product
approval. Number and boolean presence (`limitedUse`, `_turnLimit`) stay deferred.

### D1 `challengeRating` collision — confirmed mechanism

`registerSlotItem` calls `registry.set(slotKey, …)` with no `registry.has`
guard. The statistics select and the metadata slot both use `challengeRating`,
so the later entry wins and the select's label can be replaced by the slot
name. Smallest fix, on the defect track: rename the slot (for example
`_challengeRatingMeta`) and, if other collisions exist, skip `registry.set`
when a `control` entry is already present. Not fixed in Phase 0.

### D2 true-form confirmation freshness — theoretical

`useMonsterFormsLifecycle` stores `plan.next` and applies it on confirm.
`ConfirmDialog` is a modal `AlertDialog`, so pointer and keyboard input outside
it is blocked. Save and discard live in the edit footer and do not run while
the dialog is open. Unmount drops pending state with the dialog. No async
catalog or value sync writes `forms`, traits, or action sections while that
dialog is open. **No code change.** A stale write would require a background
writer that is not in this form.

## Register by decision

Columns below use short labels. Stage is `candidate` unless a spike moved it.
Owner is the feature folder.

### Phase 1

| Identity                                                                 | Stage                | Tag | Decision                                 |
| ------------------------------------------------------------------------ | -------------------- | --- | ---------------------------------------- |
| `mechanics-form-fields.ts` / `_editionPresetEffects`                     | completed            | V   | migrated to `buildMechanicsValueSyncs()` |
| `character-configuration-form-fields.ts` / `_extendedProgressionEffects` | candidate            | C   | retain unless mount and re-seed match    |
| `ownedSlot` ×5                                                           | candidate            | C   | tab `errorPaths` only after claim parity |
| `resolution-form-slots.ts` / `_resolutionEffectsApplicationLabel`        | candidate            | C   | hint or display text                     |
| `mechanics-form-fields.ts` / `_mechanicsLeadCopy`                        | feasibility verified | C   | display text; PageHeader cannot host it  |

### Display candidates (text and notice)

Phase 2a/3a. Previews are excluded by the PoC.

| Identity                                                                     | Responsibility                                 | Tag |
| ---------------------------------------------------------------------------- | ---------------------------------------------- | --- | -------------------------------------------------------------------------------------------- |
| `_standardLevelRangeSummary`, `_extendedLevelRangeSummary`                   | live muted summary                             | P   | **Completed:** `kind: 'display'` via `level-range-summary-display.lib.ts`                    |
| `_resolutionSelectionHints`                                                  | multi-paragraph guidance                       | C   |
| `_outcomeApplicationStatus`                                                  | derived status                                 | P   |
| `spellcastingFeatureSummary`                                                 | copy plus cross-tab link                       | C   |
| `cultureNamingAlert`, `_effectsPersistenceNotice`, `_grantTypeMissingRepair` | notice                                         | P   | **Completed (pilot):** `cultureNamingAlert`, `_effectsPersistenceNotice` → `kind: 'display'` |
| `buildAdvisories` (factory + trait literal)                                  | advisory title and tone                        | P   |
| `weaponProficiencyReconciliation` ×2                                         | notice plus flag clear                         | C   |
| `baseStatistics`                                                             | supporting sentence                            | P   |
| `_effectsPreview`, `_resolutionProjectilesPreview`                           | read-only preview without whole-form normalize | C   |
| `armorClass.preview`                                                         | preview plus catalog loading                   | C   |
| `formsShapeShifting`                                                         | designation, editor, difference radio (split)  | C   |

### Retained because the preview PoC failed

`attackPreview`, `spellPreview`, `multiattackPreview`, `shapeShiftSummary`,
`parryPreview`, `bonusPreview`, `traitPreview`. Blocker: whole-form
normalization and id lookup, plus a title hook. HTML previews
(`spellPreview`, `parryPreview`, `bonusPreview`) also stay out of display v1
because `html` is excluded.

### Retained slots (custom or transactional)

Tab editors (`abilityScores`, `equipment`, `traits`, `actions`), creature
pickers (`proficiencies.skills`, `proficiencies.languages`, `senses`,
`communication.telepathy`), table builders (`tables`, `progressionEditor`,
`spellbookAcquisitionEditor`, `_xpThresholdsField`, `_spellcastingProgressionField`),
assignment boards, media, campaign availability (`available`,
`contentAvailabilitySlot`, `startingDistricts`), `prerequisiteEditor`,
resolution graph (`_resolutionOutcomes`, `_resolutionProgression`,
`_resolutionEmptyState`, `_saveRepeatSave`, `_saveFailureOrSuccess`),
`frequency`, `usageReferences`, builder registration slots, `publishCatalogWriteGate`,
proficiency cues, narrative generation, `attackRangeCluster`, and the
transactional set (`formsShapeShifting` designation half, resolution confirms
and selects, organization starting point and familiar type, spellcasting
availability, `castingAbility`, armor `bodyArmor` / `shield`).

`limitedUse` and `_turnLimit` stay slots until disclosure can express sibling
clears and boolean absence. Hidden registration slots stay until that extension
is approved.

## Presentation gaps (product)

| Topic                             | Gap                                       | Approval                        |
| --------------------------------- | ----------------------------------------- | ------------------------------- |
| Level-range summaries             | live text is in display v1                | parity tests, no product change |
| Resolution hints                  | condensing paragraphs                     | yes, if copy changes            |
| `_turnLimit`                      | checkbox versus absent key                | yes                             |
| `formAvailability`                | disclosure would change empty-list timing | yes                             |
| `omittedComponents`               | checkbox group versus chips               | yes                             |
| True form and resolution confirms | runtime consequence copy                  | Phase 4, no simplification      |
| `challengeRating` zero-XP         | checkbox stored as a number               | yes                             |
| Advisories                        | title and tone must survive               | no                              |
| HTML action previews              | stay slots after PoC fail                 | no                              |

## Ownership

Dashboard content and character features own the slot components. `@rpg/ui/form`
owns walkers, registry, `valueSyncs`, and any future `kind: 'display'`. Phase 0
does not add that kind.
