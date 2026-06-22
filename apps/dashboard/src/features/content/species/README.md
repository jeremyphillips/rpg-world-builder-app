# content / species

Playable species / ancestries. Part of the [`content`](../README.md) feature;
see [feature-conventions](../../../../docs/feature-conventions.md) for layout.

Create/edit forms use [`TabbedForm`](../../../../../packages/ui/docs/forms.md) with tabs: **Basics**, **Traits**, and **Heritage choices**.

The **Traits** tab is a master-detail editor over the species's embedded `traits` array, built on the shared content master-detail abstraction (see [`content` README](../README.md#master-detail-abstraction)): a selectable list on the left (each row shows a **Custom** or **Grant** eyebrow), the selected trait's form on the right. It binds to the parent form via `useFieldArray`, so global save and validation are unchanged from the previous inline array.

Delete-locking is **derived** because species traits have no per-trait `source` in the contract: when editing a species whose `source` is `system`, its already-saved traits are protected (no remove control, **System** badge) while newly added rows stay deletable; homebrew species allow deleting any row. Removable rows confirm via the shared `MasterDetailDeleteDialog`. This mirrors the classes **Features** tab policy.

## Key files

| Area                       | Path                                       |
| -------------------------- | ------------------------------------------ |
| Form def                   | `lib/species-form-def.ts`                  |
| Shared trait row fields    | `lib/species-trait-form-fields.ts`         |
| Traits tab (master-detail) | `components/species-traits-tab.client.tsx` |
