# content / species

Playable species / ancestries. Part of the [`content`](../README.md) feature;
see [feature-conventions](../../../../docs/feature-conventions.md) for layout.

Create/edit forms use [`TabbedForm`](../../../../../packages/ui/docs/forms.md) with tabs: **Basics**, **Traits**, and **Heritage**.

The **Traits** tab is a master-detail editor over the species's embedded `traits` array, built on the shared content master-detail abstraction (see [`content` README](../README.md#master-detail-abstraction)): a selectable list on the left (each row shows a **Custom** or **Grant** eyebrow), the selected trait's form on the right. It binds to the parent form via `useFieldArray`, so global save and validation are unchanged from the previous inline array.

The **Heritage** tab edits an optional singular `heritage` object: scalar **name** (with a hint for lineage/ancestry wording) and **description** at the top, then a master-detail list over `heritage.options` (trait rows, same field helpers as the Traits tab). An empty state offers **Add heritage**; once present, options use **Add option**. No list eyebrows on options.

Delete-locking is **derived** because species traits and heritage have no per-row `source` in the contract: when editing a species whose `source` is `system`, its already-saved heritage block and saved options are protected (no remove control, **System** badge) while newly added options stay deletable; homebrew species allow removing the heritage block and any option. Removable rows confirm via the shared `MasterDetailDeleteDialog`. This mirrors the classes **Features** tab policy.

## Key files

| Area                               | Path                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| Form def                           | `lib/species-form-def.ts`                                                                          |
| Trait row fields / values / labels | `lib/species-trait-form-fields.ts`, `species-trait-form-values.ts`, `species-trait-form-labels.ts` |
| Heritage row fields                | `lib/species-heritage-form-fields.ts`                                                              |
| Rules tab (character creation)     | `lib/species-rules-form-fields.ts`                                                                 |
| Shared master-detail lock helper   | [`content/lib/is-embedded-row-system-locked.ts`](../lib/is-embedded-row-system-locked.ts)          |
| Traits tab (master-detail)         | `components/species-traits-tab.client.tsx`                                                         |
| Heritage tab (master-detail)       | `components/species-heritage-tab.client.tsx`                                                       |
