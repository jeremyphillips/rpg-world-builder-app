# content / classes

Character classes — overview, detail (with read-only progression table), and schema-driven create/edit forms.

Part of the [`content`](../README.md) feature; see [feature-conventions](../../../../docs/feature-conventions.md) for layout.

Create/edit forms use [`TabbedForm`](../../../../../packages/ui/docs/forms.md) with tabs: **Basics**, **Proficiencies**, **Spellcasting**, **Features**, and **Subclasses** (master-detail editor for per-subclass authoring — local state only until persistence is wired).

The **Features** tab is a master-detail editor over the class's embedded `features` array: a selectable list on the left, the selected feature's form on the right. It binds to the parent form via `useFieldArray` (see `lib/use-master-detail-array.ts`), so global save and validation are unchanged from the previous inline array. Resources remain inline below.

The **Subclasses** tab uses a list + editor layout: seed subclasses load from the API, edits and drafts are kept in local state, each row has an **Active in campaign** toggle, and homebrew/unsaved drafts can be deleted via `ConfirmDialog`. Authoring is gated when **Subclass choice level** on Basics is "None", or on create until the class is saved.

## Key files

| Area                                 | Path                                             |
| ------------------------------------ | ------------------------------------------------ |
| Class form def                       | `lib/class-form-def.ts`                          |
| Subclass form def                    | `lib/subclass-form-def.ts`                       |
| Shared feature row fields            | `lib/class-feature-form-fields.ts`               |
| Features tab (master-detail)         | `components/class-features-tab.client.tsx`       |
| Master-detail array hook             | `lib/use-master-detail-array.ts`                 |
| Generic list panel                   | `components/master-detail-list-panel.client.tsx` |
| Subclasses tab                       | `components/class-subclasses-tab.client.tsx`     |
| Spell progression grid helpers       | `lib/progression-table-helpers.ts`               |
| Cantrip template presets (seed-only) | `lib/cantrips-profiles.ts`                       |
| Read-only progression table          | `components/class-progression-table.tsx`         |

Spellcasting contract shape, preparation modes, and the sparse/dense progression model are documented in [content-types.md](../../../../../docs/content-types.md#class-spellcasting-reference).
