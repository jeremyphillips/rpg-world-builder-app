# content / classes

Character classes — overview, detail (with read-only progression table), and schema-driven create/edit forms.

Part of the [`content`](../README.md) feature; see [feature-conventions](../../../../docs/feature-conventions.md) for layout.

Create/edit forms use [`TabbedForm`](../../../../../packages/ui/docs/forms.md) with tabs: **Basics**, **Proficiencies**, **Spellcasting**, **Features**, **Subclasses** (master-detail editor for per-subclass authoring — local state only until persistence is wired), and **Character creation** (starting equipment packages — always editable, including on system classes).

The **Features** tab is a master-detail editor over the class's embedded `features` array, built on the shared content master-detail abstraction (see [`content` README](../README.md#master-detail-abstraction)): a selectable list on the left (each row shows a **Level** eyebrow), the selected feature's form on the right. It binds to the parent form via `useFieldArray`, so global save and validation are unchanged from the previous inline array. Resources remain inline below.

Delete-locking is **derived** because class features have no per-feature `source` in the contract: when editing a class whose `source` is `system`, its already-saved features are protected (no remove control, **System** badge) while newly added rows stay deletable; homebrew classes allow deleting any row. Removable rows confirm via the shared `MasterDetailDeleteDialog`. An **Active in campaign** toggle is intentionally deferred for features (no per-feature availability contract yet) — the abstraction leaves a documented slot for it.

The **Character creation** tab edits optional `characterCreation.startingEquipment`: a top-level choose count and master-detail packages (`standard`, `gold`, `heavy`, etc.) with fixed items, pool choices, wealth grants, and spellcasting focus modifiers. Packages stay fully editable on system classes (no delete lock). An empty state offers **Add starting equipment**; defaults seed standard + gold packages.

The **Subclasses** tab uses a list + editor layout: seed subclasses load from the API, edits and drafts are kept in local state, each row has an **Active in campaign** toggle, and homebrew/unsaved drafts can be deleted via `ConfirmDialog`. Authoring is gated when **Subclass choice level** on Basics is "None", or on create until the class is saved.

## Key files

| Area                                 | Path                                                                       |
| ------------------------------------ | -------------------------------------------------------------------------- |
| Class form def                       | `lib/class-form-def.ts`                                                    |
| Class form fields / values / labels  | `lib/class-form-fields.ts`, `class-form-values.ts`, `class-form-labels.ts` |
| Subclass form fields / values        | `lib/subclasses/subclass-form-fields.ts`, `subclass-form-values.ts`        |
| Shared feature row fields            | `lib/class-feature-form-fields.ts`                                         |
| Features tab (master-detail)         | `components/class-features-tab.client.tsx`                                 |
| Character creation tab               | `components/class-character-creation-tab.client.tsx`                       |
| Starting equipment form              | `lib/character-creation/class-starting-equipment-form-*.ts`                |
| Subclasses tab                       | `components/class-subclasses-tab.client.tsx`                               |
| Spell progression grid helpers       | `lib/progression-table-helpers.ts`                                         |
| Cantrip template presets (seed-only) | `lib/cantrips-profiles.ts`                                                 |
| Read-only progression table          | `components/class-progression-table.tsx`                                   |
| Detail feature list item             | `lib/feature-item.tsx`                                                     |

Spellcasting contract shape, preparation modes, and the sparse/dense progression model are documented in [content-types.md](../../../../../docs/content-types.md#class-spellcasting-reference).
