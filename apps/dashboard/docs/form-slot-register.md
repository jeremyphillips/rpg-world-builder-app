# Form slot register

Production `kind: 'slot'` declarations in the dashboard. Tests, stories, and
prose mentions are not declarations. `locations/README.md` names `kind: 'slot'`
and is not one.

**88 static literals in 38 files, 86 identities.**

The ratchet allowlist is
`apps/dashboard/src/test/form-slot-literal-baseline.json`. Each key is the
source file plus the slot `name` literal, or `file::factory()` when the name is
a parameter or other non-literal. A repeated name in one file keeps a count.
Removing an identity may leave the allowlist high. Adding or renaming one fails
until this register and the allowlist both grow.

The baseline is a static allowlist. It is not the runtime uniqueness rule.
`registerSlotItem` keys the field registry by `prefix.name` (or `name` at the
root) and replaces an existing key. A slot must not use the same name as a
control on that prefixed path. One factory or one repeated name under different
prefixes — `formAvailability` per row, `${sourcePath}.castingAbility`,
`_turnLimit` inside action composers — is one identity pattern, not one
baseline row per row. Do not retune baseline counts to stand in for that rule.
`kind: 'slot'` literals stay in the registration module. Moving a literal into
a render file changes the ratchet key.

## Baseline (static literals per file)

| File                                                                     | Literals |
| ------------------------------------------------------------------------ | -------: |
| `spells/resolution/lib/form/resolution-form-slots.ts`                    |        9 |
| `monsters/lib/monster-form-fields.tsx`                                   |        7 |
| `monsters/lib/actions/detail-fields/section-composers.tsx`               |        6 |
| `monsters/lib/creature-details/monster-creature-details-form-fields.tsx` |        5 |
| `monsters/lib/actions/detail-fields/shared-mechanics.tsx`                |        5 |
| `character/lib/steps/identity-form-fields.ts`                            |        5 |
| `character/lib/steps/abilities-form-fields.ts`                           |        5 |
| `lib/forms/organization-form-projection.ts`                              |        4 |
| `campaign/.../character-configuration-form-fields.ts`                    |        3 |
| `classes/lib/class-spellcasting-form-fields.ts`                          |        3 |
| `monsters/lib/statistics/monster-armor-class-fields.tsx`                 |        3 |
| `monsters/lib/actions/detail-fields/save-authoring.tsx`                  |        3 |
| Remaining 26 files                                                       | 1–2 each |

`ownedSlot` in `monster-form-fields.tsx` is one factory covering five names:
`experiencePointsOverride`, `proficiencies.savingThrows`, `bonusActions`,
`reactions`, `legendaryActions`. Runtime multipliers (not extra identities):
`monsterFormAvailabilityField` (every restricted action/trait row),
`buildAdvisories` (action composers and trait rows), `_turnLimit`,
`castingAbility` variants, action previews, `_grantTypePersist` /
`_grantTypeMissingRepair`, `_effectId` / `_definition`, `_outcomeApplicationStatus`,
and `contentAvailabilitySlot` across content shells.

## Constraints

### Action previews stay slots

`attackPreview` (`MonsterActionAttackSummary`) reads the whole form with
`useWatch()`, normalizes `MonsterFormValues`, and finds the row by `action.id`
across action sections. It also needs challenge rating, ability scores, the
equipment catalog, `ctx.armorClassRules`, and a title from
`useMonsterActionPreviewTitle`. `dependsOn` plus `contentWhen` cannot express
that without a render callback. Display does not grow one.

`parryPreview` is the same shape at smaller scale. `spellPreview`,
`multiattackPreview`, `shapeShiftSummary`, `bonusPreview`, and `traitPreview`
stay slots for the same reason. HTML previews (`spellPreview`, `parryPreview`,
`bonusPreview`) are also outside display, which has no `html` block.

### Display

Walkers that switch on `kind` include `display`. Display items are excluded from
`kind: 'row'` because `RowFieldItem` is narrower than `GroupFieldItem`. A
required `id` keeps reorder stable when the block has no field name. Empty
resolved content renders no DOM. Live `text` uses `live: 'polite'` and the roles
`supporting`, `caption`, and `muted`. `label` and `emphasis` are excluded.
`aria-atomic` is not required. Mounting a live region with content is not
announced.

### `dependsOn`

Paths are relative to `namePrefix`. Each `../` pops one segment, including
indexes, and extra hops clamp to the root. There is no root-anchored form.

### Slots that stay until behavior matches

`ownedSlot` registers a `hostSlot` labeled with the raw path and owns the tab
prefix. It does not register the control or claim issues. Tab `errorPaths`
cover the badge prefix only. Removing the host entry can change footer copy
from the raw path to the unlabeled fallback. It stays until a comparison of
badge counts, footer summary, and claim targets matches. Raw-path labels are a
copy defect on their own.

`_extendedProgressionEffects` writes on every dependency change, including
mount, and re-seeds `extendedMaxLevel` when the author clears it. `valueSyncs`
skip the first observation, so they do not match. A replacement has to match
create, load, toggle, clear, standard-max change, reset, dirty state, and
`null` versus object serialization.

`_grantTypePersist`, `_effectId`, and
`_organizationMembershipTitlesRegistration` keep values registered while the
visible control is absent. `valueSyncs` and `optionalDisclosure` do not.

`optionalDisclosure` treats a populated array as expanded. Species
`personalNameComponents` can use that only if `undefined`, `[]`, and a
non-empty list stay distinct in the payload. Monster `omittedComponents` is a
checkbox group. `limitedUse` and `_turnLimit` stay slots because disclosure
cannot express number presence or boolean absence.

### Field registry

`registerSlotItem` replaces an existing key. A slot must not use the same name
as a control.

### Open issues

**True-form confirmation freshness.** `useMonsterFormsLifecycle` stores
`plan.next` and applies it on confirm. `ConfirmDialog` blocks pointer and
keyboard input outside the dialog, and save/discard live in the edit footer, so
they do not run while it is open. Unmount drops pending state with the dialog.
No async catalog or value sync writes `forms`, traits, or action sections while
that dialog is open. Leave the code unchanged. A stale write would require a
background writer that this form does not have. Modal blocking does not prove
that a `reset` or other programmatic write is impossible.

## Migrated off slots

| Identity                                                                     | Replacement                                                    |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `_editionPresetEffects`                                                      | `buildMechanicsValueSyncs()`                                   |
| `_mechanicsLeadCopy`                                                         | `mechanics-lead-copy-display.lib.ts`                           |
| `_resolutionEffectsApplicationLabel`                                         | `resolution-effects-application-label-display.lib.ts`          |
| `_standardLevelRangeSummary`, `_extendedLevelRangeSummary`                   | `level-range-summary-display.lib.ts`                           |
| `_resolutionSelectionHints`                                                  | `resolution-selection-hints-display.lib.ts`                    |
| `spellcastingFeatureSummary`                                                 | `classSpellcastingFeatureSummaryDisplay()` (`featureTableRow`) |
| `cultureNamingAlert`, `_effectsPersistenceNotice`, `_grantTypeMissingRepair` | `kind: 'display'`                                              |
| `buildAdvisories`                                                            | `monsterFormAdvisoryDisplay()`                                 |
| `baseStatistics`                                                             | `defined-form-base-statistics` display                         |

## Conditional

| Identity                                           | Why it is still a slot                              |
| -------------------------------------------------- | --------------------------------------------------- |
| `_extendedProgressionEffects`                      | `valueSyncs` skip mount and do not re-seed on clear |
| `ownedSlot` ×5                                     | tab `errorPaths` cover the badge prefix only        |
| `_outcomeApplicationStatus`                        | derived status; not a static notice                 |
| `weaponProficiencyReconciliation` ×2               | notice plus a flag clear                            |
| `_effectsPreview`, `_resolutionProjectilesPreview` | read-only preview without whole-form normalize      |
| `armorClass.preview`                               | preview plus catalog loading                        |

## Transactional slots

These intercept a write, run a domain planner, show runtime consequence copy,
and apply several updates after confirm. `display` and `valueSyncs` do not do
that. `ConfirmDialog` is the shared modal. The feature controller owns the
request, the planner, pending state, whether to re-plan, and the patch.

Monster true form stores `plan.next` in provider state and applies that
snapshot. Pending dies with the provider. Spell resolution stores the request
on a per-form `WeakMap` and plans again from current values on confirm. Pending
lasts as long as that form `control`. Do not unify those lifetimes. One confirm
is one author action. The handlers still publish sequential `setValue` and
field-array updates. Consequence copy stays as written.

| Identity                                                                                   | Owner            | Controller                   |
| ------------------------------------------------------------------------------------------ | ---------------- | ---------------------------- |
| `formsShapeShifting` (designation, removal, remove-all)                                    | Monster forms    | `useMonsterFormsLifecycle`   |
| `_resolutionChangeConfirm`, `_resolutionChangeNotice`                                      | Spell resolution | `useResolutionChangeConfirm` |
| `_resolutionSelectionModeSelect`, `_resolutionProximitySelect`, `_resolutionHowItResolves` | Spell resolution | `requestResolutionChange`    |
| `startingPointId`, `_organizationEditFamiliarType`                                         | Organization     | feature confirm              |
| `spellcastingFeatureAvailability`                                                          | Class            | feature confirm              |
| `castingAbility` (row variants)                                                            | Monster actions  | feature confirm              |
| `armorClass.bodyArmor`, `armorClass.shield`                                                | Armor            | replacement transaction      |

## Value-mapping exception

`_challengeRatingZeroXp` stays a slot. It is a checkbox for challenge rating
`0`, and it maps that checkbox onto `experiencePointsOverride`. It is not a
boolean field, and it is not a shared checkbox mapping. The select owns
`challengeRating`. A publish-validation test checks that a missing rating is
claimed by that select.

- The slot registers `experiencePointsOverride` with `shouldUnregister: false`,
  so a loaded `0` stays in form values.
- Checked writes `experiencePointsOverride: 0`.
- Unchecked removes `experiencePointsOverride`.
- The `challengeRating` select is unchanged.
- The metadata display uses the override only when the rating is `0`.
- Leaving CR 0 clears the override through the monster form value sync.
  Returning to CR 0 shows the checkbox unchecked.
- Load and reset restore the saved override. A loaded `0` shows the box
  checked again.

## Other retained slots

Tab editors (`abilityScores`, `equipment`, `traits`, `actions`), creature
pickers (`proficiencies.skills`, `proficiencies.languages`, `senses`,
`communication.telepathy`), table builders (`tables`, `progressionEditor`,
`spellbookAcquisitionEditor`, `_xpThresholdsField`, `_spellcastingProgressionField`),
assignment boards, media, campaign availability (`available`,
`contentAvailabilitySlot`, `startingDistricts`), `prerequisiteEditor`,
resolution graph (`_resolutionOutcomes`, `_resolutionProgression`,
`_resolutionEmptyState`, `_saveRepeatSave`, `_saveFailureOrSuccess`),
`frequency`, `usageReferences`, builder registration slots,
`publishCatalogWriteGate`, proficiency cues, narrative generation, and
`attackRangeCluster`.

Action previews retained for the whole-form reason above: `attackPreview`,
`spellPreview`, `multiattackPreview`, `shapeShiftSummary`, `parryPreview`,
`bonusPreview`, `traitPreview`.

## Unsupported patterns

A slot that needs one of these stays a slot.

- Confirm-gated multi-path writes. There is no field-change guard and no patch
  DSL. Two confirmation dialogs are not a reason to add one.
- `valueSyncs` as a transaction. They skip the first observation, fire when a
  dependency changes identity, and write one reaction with
  `shouldValidate: false`.
- Display `html`, and previews that need whole-form normalization or a title hook.
  Display is `text`, `notice`, and data-only `rulesPreview`.
- Display inside `kind: 'row'`.
- Root-anchored `dependsOn`, chips for number or boolean presence, and a shared
  hidden-registration kind.

A custom transactional slot is a supported outcome.

## Presentation gaps

| Topic                             | Gap                                       | Decision                 |
| --------------------------------- | ----------------------------------------- | ------------------------ |
| Resolution hints                  | condensing paragraphs                     | only if copy changes     |
| `_turnLimit`                      | checkbox versus absent key                | needs a product decision |
| `formAvailability`                | disclosure would change empty-list timing | needs a product decision |
| `omittedComponents`               | checkbox group versus chips               | needs a product decision |
| True form and resolution confirms | runtime consequence copy                  | keep the current copy    |
| Advisories                        | title and tone must survive               | keep both                |
| HTML action previews              | outside display                           | stay slots               |

## Monster entry modules

Monster registration stays in `monsters/lib/**`. The render for a non-null
monster slot is a `*.slot.tsx` module under
`monsters/components/form/slots/` (tabs, statistics, creature-details, …) or
`monsters/components/form/actions/**` for action-kind and shared action slots.
Do not reintroduce `form/slots/actions/`.

Host-null slots (`ownedSlot`, `render: () => null`) have no entry module.

A component that is only used as the slot render is that entry file. A second
module exists only when the same UI is also mounted outside the slot, or when
a tab panel is the tab and the entry only passes `ctx`. Do not leave a
re-export at the old path. Do not add `form/slots/index.ts`.

That layout is in place. The identity inventory in this register does not
move with those files. The file map is the
[creature form-slot plan](../../../.cursor/plans/creature_form_slot_architecture_f1b1d1f5.plan.md).

Co-located stories and component tests move with the module
(`attack-preview.slot.stories.tsx` beside `attack-preview.slot.tsx`). Dashboard
modules do not use a `.client` suffix or `'use client'`.

## Ownership

Dashboard content and character features own the slot components. `@rpg/ui/form`
owns walkers, the field registry, `valueSyncs`, and `kind: 'display'`. Slot
entry layout for monsters is the section above, not a second copy of the rules
in the form-lib conventions.
