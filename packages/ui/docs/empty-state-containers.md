# Empty state containers

Recessed empty wells use the **sunken** surface plane — not `bg-background`, `bg-field-container`, or wash tokens.

Token detail: [design-tokens.md](./design-tokens.md#surface-hierarchy). Surface API: [visual-vocabulary.md](./visual-vocabulary.md#phase-2--surface-and-chrome-migration).

## Contract

| Property        | Value                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Fill            | `bg-sunken`                                                                |
| Border          | `border-border` (add `border-dashed` for authoring gates / picker empties) |
| Shadow          | `shadow-surface-sunken`                                                    |
| Surface context | `establishSurfaceCurrent('sunken')`                                        |
| Semantics       | `role="status"` on the well root                                           |
| Typography      | Surface-relative muted only — see below                                    |

Shared recipes live in [`empty-state-well.variants.ts`](../src/components/ui/empty-state-well.variants.ts).

### Typography (muted on `--sunken`)

The shell must include `establishSurfaceCurrent('sunken')` so `text-muted-foreground` mixes toward the sunken plane (not the page canvas).

| Role                 | Export                                   | Use                                                       |
| -------------------- | ---------------------------------------- | --------------------------------------------------------- |
| Compact body         | `emptyStateWellBodyClasses`              | `EmptyPanel`, single-line `No X added.`                   |
| Gate title           | `emptyStateWellTitleClasses`             | Short headline inside dashed gates                        |
| Large title          | `emptyStateWellTitleLgClasses`           | Master-detail / heritage placeholders                     |
| Supporting copy      | `emptyStateWellSupportingClasses`        | Gate descriptions                                         |
| Large supporting     | `emptyStateWellSupportingLgClasses`      | Master-detail subheads                                    |
| Decorative icon (md) | `emptyStateWellIconMdClasses`            | Table-builder gate icons (`size-8`)                       |
| Decorative icon (lg) | `emptyStateWellIconLgClasses`            | Master-detail hero icons (`size-10`)                      |
| Inline icon          | `resolveEmptyStateWellIconClasses(step)` | Glyph-ladder icons inside wells                           |
| Icon ink             | `emptyStateWellIconInkClasses`           | `text-muted-foreground opacity-50` — icons sit below copy |

Prefer `Text variant="caption" | "small" | "muted"` or `InsetPanel.Text` when using components — they resolve to `text-muted-foreground`. Do **not** use `text-foreground` inside empty wells.

## Primitives (prefer these)

| Primitive                                                   | Use when                                                | Notes                                                                              |
| ----------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [`EmptyPanel`](../src/components/ui/empty-panel.client.tsx) | Compact inline wells inside forms/lists (`No X added.`) | Solid border, sm padding                                                           |
| [`InsetPanel`](../src/components/ui/inset-panel.client.tsx) | Larger dashed/centered gates                            | Default surface is sunken; use `borderStyle="dashed"` for picker/authoring empties |
| `insetPanelEmptyStateClasses`                               | Class-only dashed empty preset                          | Same fill as gate preset                                                           |
| `insetPanelGateClasses`                                     | Large dashed authoring blockers                         | Reference implementation                                                           |

Do **not** pass `surface={{}}` to suppress fill on empty wells — that escape hatch is for non-empty interactive shells only.

## Inventory

### A. Recessed panel empties

| Location                                                                                                                                                                                            | Primitive                      | Status                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ------------------------- |
| Array field empty ([`array-field-empty-state.client.tsx`](../src/form/renderers/array/array-field-empty-state.client.tsx))                                                                          | `EmptyPanel`                   | Compliant (via primitive) |
| Feature tables section ([`feature-tables-section.tsx`](../../apps/dashboard/src/features/content/classes/components/features/feature-tables-section.tsx))                                           | `EmptyPanel`                   | Compliant (via primitive) |
| Catalog picker sheet ([`catalog-picker-sheet.client.tsx`](../src/components/ui/catalog-picker-sheet.client.tsx))                                                                                    | `InsetPanel` dashed            | Compliant                 |
| Catalog picker results ([`catalog-picker-results-state.tsx`](../../apps/dashboard/src/features/character/components/picker/results/catalog-picker-results-state.tsx))                               | `InsetPanel` dashed            | Compliant                 |
| Connections step empty ([`connections-step.tsx`](../../apps/dashboard/src/features/character/components/builder/steps/connections/connections-step.tsx))                                            | `InsetPanel` dashed            | Compliant                 |
| Content form placeholder ([`content-form-shell-layout.tsx`](../../apps/dashboard/src/features/content/lib/forms/shells/layout/content-form-shell-layout.tsx))                                       | `InsetPanel` dashed            | Compliant                 |
| Table builder inset gate ([`table-builder-inset-gate.tsx`](../../apps/dashboard/src/features/content/components/table-builder/table-builder-inset-gate.tsx))                                        | `InsetPanel` dashed sunken     | Compliant                 |
| Equipment purchase empty panels ([`equipment-picker-purchase.variants.ts`](../../apps/dashboard/src/features/character/components/equipment/picker/purchase/equipment-picker-purchase.variants.ts)) | `emptyStateWellSurfaceClasses` | Compliant                 |
| Equipment inventory empties                                                                                                                                                                         | `InsetPanel` default           | Compliant                 |
| Subclass tab gates ([`class-subclasses-tab-gates.tsx`](../../apps/dashboard/src/features/content/classes/components/subclasses/class-subclasses-tab-gates.tsx))                                     | `InsetPanel` dashed sunken     | Compliant                 |
| Quick NPC build card                                                                                                                                                                                | `bg-sunken` variant            | Compliant                 |

### B. Master-detail placeholders

| Location                                                                                                                                                     | Status                   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| [`MasterDetailEditorEmptyState`](../../apps/dashboard/src/features/content/components/master-detail/master-detail-editor-empty-state.tsx)                    | Compliant — sunken shell |
| Species heritage empty ([`species-heritage-tab.variants.ts`](../../apps/dashboard/src/features/content/species/components/species-heritage-tab.variants.ts)) | Compliant — sunken shell |

### Out of scope (copy-only / inline)

| Location                                                                                   | Reason                                                            |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `IndexPageEmptyState`, messages workspace empties, `NotificationEmptyState`                | Page-level typography — no recessed container                     |
| Data table empty cell, spell resolution text-only empty, location connected-parties helper | Inline muted text                                                 |
| Fixed-scores DnD pool                                                                      | Interactive shell — keep `emphasis: 'subtle'`, not an empty state |

## Drift guard

[`empty-state-well.variants.test.ts`](../src/components/ui/empty-state-well.variants.test.ts) asserts shell + content classes stay on `bg-sunken` and `text-muted-foreground`. Do not add new dashboard-local bordered empty wells with ad-hoc `bg-background` / `bg-field-container` / `text-foreground` stacks.
