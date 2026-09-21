# content / classes

Character classes — overview, detail (with read-only progression table), and schema-driven create/edit forms.

Part of the [`content`](../README.md) feature; see [feature-conventions](../../../../docs/feature-conventions.md) for layout.

Create/edit forms use [`TabbedForm`](../../../../../packages/ui/docs/forms.md) with tabs: **Basics**, **Proficiencies**, **Spellcasting**, **Features**, **Subclasses** (master-detail editor with separate **Save subclass** per row), and **Character creation** (**Starting equipment** — always editable, including on system classes).

The **Features** tab is a master-detail editor over the class's embedded `features` array, built on the shared content master-detail abstraction (see [`content` README](../README.md#master-detail-abstraction)): a selectable list on the left (each row shows a **Level** eyebrow), the selected feature's form on the right. Per-row campaign availability (`available` on the class body) uses the shared master-detail availability chrome — broad header + **Change** (availability-only dialog, no player access) — and saves with the class form. It binds to the parent form via `useFieldArray`, so global save and validation are unchanged from the previous inline array.

Delete-locking is **derived** because class features have no per-feature `source` in the contract: when editing a class whose `source` is `system`, its already-saved features are protected (no remove control, **System** badge) while newly added rows stay deletable; homebrew classes allow deleting any row. Removable rows confirm via the shared `MasterDetailDeleteDialog`. The explicit `<Class> Subclass` feature row is the source of truth for when subclass authoring unlocks.

The **Character creation** tab edits optional `characterCreation.startingEquipment`: a schema-driven intro group (legend + description in field-container chrome) above a master-detail package list. Packages (`standard`, `gold`, `heavy`, etc.) carry **granted** items (`kind: 'grant'` — specific gear received automatically), **choice** items (`kind: 'choice'` — player picks from a pool), wealth grants, and spellcasting focus modifiers. See `grantedEquipmentItemSchema` in `@rpg/contracts` for the discriminant vocabulary. Packages stay fully editable on system classes (no delete lock). Authors add packages via **Add package**; no default rows are seeded.

The **Subclasses** tab uses the shared [`NestedResourceMasterDetailEditor`](../components/master-detail/nested-resource-master-detail-editor.tsx): subclasses load from the nested API (system + homebrew + patches), broad campaign availability + **Change** live in the detail shell, and **Save subclass** persists the full body via nested POST/PATCH. Homebrew rows delete through the detail overflow menu and shared deletion flow (`409` when characters reference the subclass). Authoring is gated until the class is saved and until the **Features** tab includes the explicit subclass-choice feature.

## Key files

| Area                                | Path                                                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Class form def                      | `lib/class-form-def.ts`                                                                                                                                          |
| Class form hub / values / labels    | `lib/class-form-fields.ts`, `class-form-values.ts`, `class-form-labels.ts`                                                                                       |
| Class form tab field modules        | `lib/class-basics-form-fields.ts`, `class-proficiencies-form-fields.ts`, `class-spellcasting-form-fields.ts`                                                     |
| Subclass form fields / values       | `lib/subclasses/subclass-form-fields.ts`, `subclass-form-values.ts`                                                                                              |
| Shared feature row fields           | `lib/class-feature-form-fields.ts`, `lib/class-subclass-choice-features.ts`                                                                                      |
| Features tab (master-detail)        | `components/class-features-tab.tsx`                                                                                                                              |
| Character creation tab              | `components/class-character-creation-tab.tsx`                                                                                                                    |
| Starting equipment form             | `lib/character-creation/class-starting-equipment-form-*.ts`                                                                                                      |
| Subclasses tab                      | `components/class-subclasses-tab.tsx`                                                                                                                            |
| Subclass tab state / save           | `lib/subclasses/subclass-tab-state.lib.ts`, `subclass-tab-save.lib.ts`                                                                                           |
| Subclass tab hook                   | `hooks/use-class-subclasses-tab.ts`                                                                                                                              |
| Read-only progression table         | `components/detail/class-progression-table.tsx`                                                                                                                  |
| Detail feature list item            | `components/detail/class-feature-item.tsx`                                                                                                                       |
| Display registry (detail + builder) | `lib/class-display.ts` — labels and view models for detail route and builder sheet; join-dependent rendering (skill links, subclasses) stays in route components |

## Components layout

| Area                      | Path                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------- |
| Form tab shells           | `components/class-*-tab.tsx` (root)                                                                     |
| Detail presentation       | `components/detail/` — progression table, proficiencies section, feature row                            |
| Character creation UI     | `components/character-creation/` — link cues, ability-score ordering                                    |
| Subclass master-detail UI | `components/subclasses/` — detail body, gates, delete dialog; shared `NestedResourceMasterDetailEditor` |

Proficiency-linked grant labels and the generic link cue live in [`content/lib/forms/grants/`](../../lib/forms/grants/). Class form paths and navigation targets stay in `lib/character-creation/class-character-creation-link-labels.ts`; the class-specific row cue is injected into shared grant fields via `renderProficiencyLinkedGrantCue`.

`class-display.ts` owns intrinsic class data: stat rows, granted proficiencies, choice pool slugs, and features. The detail route joins skill proficiency records for linked choice labels and keeps subclasses and the progression table outside the view model. The builder sheet adapter (`buildClassDetailsSheetContent` in `apps/dashboard/src/features/character/lib/builder-class-option-display.lib.ts`) maps the same registry with `surface: 'builder-sheet'` — compact proficiency choice summaries with option-pool disclosure, level-1 features only.

Spellcasting contract shape, managed granting feature ownership, preparation modes, and the sparse/dense progression model are documented in [content-types.md](../../../../../docs/content-types.md#class-spellcasting-reference). Activation lives on a dedicated Spellcasting / Pact Magic feature row with a managed `{ kind: 'spellcasting' }` grant; mechanical config and starting recommendations stay on the Spellcasting tab.
