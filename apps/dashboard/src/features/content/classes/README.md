# content / classes

Character classes — overview, detail (with read-only progression table), and schema-driven create/edit forms.

Part of the [`content`](../README.md) feature; see [feature-conventions](../../../../docs/feature-conventions.md) for layout.

Create/edit forms use [`TabbedForm`](../../../../../packages/ui/docs/forms.md) with tabs: **Basics**, **Proficiencies**, **Spellcasting**, **Features**, **Subclasses** (master-detail editor with separate **Save subclass** per row), and **Character creation** (**Class starting options** — always editable, including on system classes).

The **Features** tab is a master-detail editor over the class's embedded `features` array, built on the shared content master-detail abstraction (see [`content` README](../README.md#master-detail-abstraction)): a selectable list on the left (each row shows a **Level** eyebrow), the selected feature's form on the right. It binds to the parent form via `useFieldArray`, so global save and validation are unchanged from the previous inline array. Resources remain inline below.

Delete-locking is **derived** because class features have no per-feature `source` in the contract: when editing a class whose `source` is `system`, its already-saved features are protected (no remove control, **System** badge) while newly added rows stay deletable; homebrew classes allow deleting any row. Removable rows confirm via the shared `MasterDetailDeleteDialog`. The explicit `<Class> Subclass` feature row is the source of truth for when subclass authoring unlocks.

The **Character creation** tab edits optional `characterCreation.startingEquipment`: master-detail packages (`standard`, `gold`, `heavy`, etc.) with **granted** items (`kind: 'grant'` — specific gear received automatically), **choice** items (`kind: 'choice'` — player picks from a pool), wealth grants, and spellcasting focus modifiers. See `grantedEquipmentItemSchema` in `@rpg/contracts` for the discriminant vocabulary. Packages stay fully editable on system classes (no delete lock). An empty state offers **Add starting equipment**; defaults seed standard + gold packages.

The **Subclasses** tab uses a list + editor layout: subclasses load from the nested API (system + homebrew + patches), each row has an **Active in campaign** toggle (dedicated availability PATCH), and **Save subclass** persists the full body via nested POST/PATCH. Homebrew rows delete through the shared deletion flow (`409` when characters reference the subclass). Authoring is gated until the class is saved and until the **Features** tab includes the explicit subclass-choice feature.

## Key files

| Area                                 | Path                                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Class form def                       | `lib/class-form-def.ts`                                                                                                                                          |
| Class form hub / values / labels     | `lib/class-form-fields.ts`, `class-form-values.ts`, `class-form-labels.ts`                                                                                       |
| Class form tab field modules         | `lib/class-basics-form-fields.ts`, `class-proficiencies-form-fields.ts`, `class-spellcasting-form-fields.ts`, `class-resources-form-fields.ts`                   |
| Subclass form fields / values        | `lib/subclasses/subclass-form-fields.ts`, `subclass-form-values.ts`                                                                                              |
| Shared feature row fields            | `lib/class-feature-form-fields.ts`, `lib/class-subclass-choice-features.ts`                                                                                      |
| Features tab (master-detail)         | `components/class-features-tab.client.tsx`                                                                                                                       |
| Character creation tab               | `components/class-character-creation-tab.client.tsx`                                                                                                             |
| Starting equipment form              | `lib/character-creation/class-starting-equipment-form-*.ts`                                                                                                      |
| Subclasses tab                       | `components/class-subclasses-tab.client.tsx`                                                                                                                     |
| Spell progression grid helpers       | `lib/progression-table-helpers.ts`                                                                                                                               |
| Cantrip template presets (seed-only) | `lib/cantrips-profiles.ts`                                                                                                                                       |
| Read-only progression table          | `components/class-progression-table.tsx`                                                                                                                         |
| Detail feature list item             | `components/class-feature-item.tsx`                                                                                                                              |
| Display registry (detail + builder)  | `lib/class-display.ts` — labels and view models for detail route and builder sheet; join-dependent rendering (skill links, subclasses) stays in route components |

## Components layout

| Area                      | Path                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------- |
| Form tab shells           | `components/class-*-tab.client.tsx` (root)                                         |
| Detail sections           | `components/class-progression-table.tsx`, `class-proficiencies-section.client.tsx` |
| Detail feature row        | `components/class-feature-item.tsx`                                                |
| Character creation UI     | `components/character-creation/` — link cues, ability-score ordering               |
| Subclass master-detail UI | `components/subclasses/` — list/editor panels, gates, delete dialog                |

Proficiency-linked grant labels and the generic link cue live in [`content/lib/forms/grants/`](../../lib/forms/grants/). Class form paths and navigation targets stay in `lib/character-creation/class-character-creation-link-labels.ts`; the class-specific row cue is injected into shared grant fields via `renderProficiencyLinkedGrantCue`.

`class-display.ts` owns intrinsic class data: stat rows, granted proficiencies, choice pool slugs, and features. The detail route joins skill proficiency records for linked choice labels and keeps subclasses and the progression table outside the view model. The builder sheet adapter (`buildClassDetailsSheetContent` in `apps/dashboard/src/features/character/lib/builder-class-option-display.lib.ts`) maps the same registry with `surface: 'builder-sheet'` — compact proficiency choice summaries with option-pool disclosure, level-1 features only.

Spellcasting contract shape, preparation modes, and the sparse/dense progression model are documented in [content-types.md](../../../../../docs/content-types.md#class-spellcasting-reference).
