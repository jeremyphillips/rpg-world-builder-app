# Empty state containers

Recessed empty wells use the **sunken** surface plane — not `bg-background`, `bg-field-container`, or wash tokens.

Token detail: [design-tokens.md](./design-tokens.md#surface-hierarchy). Surface API: [visual-vocabulary.md](./visual-vocabulary.md#phase-2--surface-and-chrome-migration).

Implementation plan: [`.cursor/plans/empty-state-well-typography.plan.md`](../../.cursor/plans/empty-state-well-typography.plan.md).

## Contract

| Property        | Value                                                                      |
| --------------- | -------------------------------------------------------------------------- |
| Fill            | `bg-sunken`                                                                |
| Border          | `border-border` (add `border-dashed` for authoring gates / picker empties) |
| Shadow          | `shadow-surface-sunken`                                                    |
| Surface context | `establishSurfaceCurrent('sunken')`                                        |
| Semantics       | Opt-in only — see [Semantics](#semantics)                                  |
| Typography      | Surface-relative muted roles — see below                                   |

Shared recipes live in [`empty-state-well.variants.ts`](../src/components/ui/empty-state-well.variants.ts).

## Copy roles (structural composition)

Classify copy by **how it is composed in the well**, not by sentence wording. A headline like “No heritage group yet” remains a **Title** when it heads supporting copy — do not reclassify from grammar alone.

| Role            | Typography             | Export / API                                                                     | Use                                                                |
| --------------- | ---------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Passive message | muted + **italic**     | `emptyStateWellPassiveMessageClasses`, `EmptyPanel`, `InsetPanel.PassiveMessage` | Single standalone message (e.g. `No organizations connected yet.`) |
| Title           | emphasized + **roman** | `emptyStateWellTitleClasses`, `emptyStateWellTitleLgClasses`                     | Structured empty headline before supporting copy                   |
| Supporting      | muted + **roman**      | `emptyStateWellSupportingClasses`, `InsetPanel.Text`                             | Instruction under a title, or standalone instructional gate copy   |

The shell must include `establishSurfaceCurrent('sunken')` so `text-muted-foreground` mixes toward the sunken plane (not the page canvas).

| Decorative role    | Export                                   |
| ------------------ | ---------------------------------------- |
| Icon (md)          | `emptyStateWellIconMdClasses`            |
| Icon (lg)          | `emptyStateWellIconLgClasses`            |
| Inline icon ladder | `resolveEmptyStateWellIconClasses(step)` |
| Icon ink           | `emptyStateWellIconInkClasses`           |

Do **not** use `text-foreground` inside empty wells. Do **not** add a global `Text variant="status"` until the recessed-well convention is validated.

## Semantics

Static empty copy does **not** need `role="status"` or `aria-live`. Reserve those for intentional announcement (e.g. counters that update during interaction).

- **`EmptyPanel`** — no default live-region role.
- **`InsetPanel.PassiveMessage`** — visual/content role only; not an ARIA status primitive.
- **`InsetPanel.Text`** — general inset copy; roman, instructional.

Pass `role="status"` on a well root only when the empty state is expected to update and be announced.

## Primitives (prefer these)

| Primitive                                                                  | Use when                                               | Notes                                                                              |
| -------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------- |
| [`EmptyPanel`](../src/components/ui/empty-panel.client.tsx)                | Compact passive single-message wells                   | Solid border, sm padding, italic on shell                                          |
| [`InsetPanel.PassiveMessage`](../src/components/ui/inset-panel.client.tsx) | Passive single-message inside dashed/large inset wells | Size-aware italic; not `role="status"`                                             |
| [`InsetPanel.Text`](../src/components/ui/inset-panel.client.tsx)           | Instructional gate / supporting copy                   | Roman; no default italic                                                           |
| [`InsetPanel`](../src/components/ui/inset-panel.client.tsx)                | Larger dashed/centered gates                           | Default surface is sunken; use `borderStyle="dashed"` for picker/authoring empties |
| Title/supporting class exports                                             | Structured title + supporting stacks                   | Table builder, master-detail, heritage                                             |
| `insetPanelEmptyStateClasses`                                              | Class-only dashed empty preset                         | Same fill as gate preset                                                           |
| `insetPanelGateClasses`                                                    | Large dashed authoring blockers                        | Reference implementation                                                           |

Do **not** pass `surface={{}}` to suppress fill on empty wells — that escape hatch is for non-empty interactive shells only.

## Inventory

### A. Recessed panel empties

| Location                                                                                                                                                                                            | Primitive                       | Status                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------- |
| Array field empty ([`array-field-empty-state.client.tsx`](../src/form/renderers/array/array-field-empty-state.client.tsx))                                                                          | `EmptyPanel`                    | Compliant (via primitive) |
| Feature tables section ([`feature-tables-section.tsx`](../../apps/dashboard/src/features/content/classes/components/features/feature-tables-section.tsx))                                           | `EmptyPanel`                    | Compliant (via primitive) |
| Catalog picker sheet ([`catalog-picker-sheet.client.tsx`](../src/components/ui/catalog-picker-sheet.client.tsx))                                                                                    | `InsetPanel` + `PassiveMessage` | Compliant                 |
| Catalog picker results ([`catalog-picker-results-state.tsx`](../../apps/dashboard/src/features/character/components/picker/results/catalog-picker-results-state.tsx))                               | `InsetPanel` + `PassiveMessage` | Compliant                 |
| Connections step empty ([`connections-step.tsx`](../../apps/dashboard/src/features/character/components/builder/steps/connections/connections-step.tsx))                                            | `InsetPanel` + `PassiveMessage` | Compliant                 |
| Content form placeholder ([`content-form-shell-layout.tsx`](../../apps/dashboard/src/features/content/lib/forms/shells/layout/content-form-shell-layout.tsx))                                       | `InsetPanel.Text`               | Instructional gate        |
| Table builder inset gate ([`table-builder-inset-gate.tsx`](../../apps/dashboard/src/features/content/components/table-builder/table-builder-inset-gate.tsx))                                        | Title + supporting classes      | Structured empty          |
| Equipment purchase empty panels ([`equipment-picker-purchase.variants.ts`](../../apps/dashboard/src/features/character/components/equipment/picker/purchase/equipment-picker-purchase.variants.ts)) | `emptyStateWellSurfaceClasses`  | Compliant                 |
| Equipment inventory empties                                                                                                                                                                         | `InsetPanel` + `PassiveMessage` | Compliant                 |
| Subclass tab gates ([`class-subclasses-tab-gates.tsx`](../../apps/dashboard/src/features/content/classes/components/subclasses/class-subclasses-tab-gates.tsx))                                     | `InsetPanel.Text`               | Instructional gate        |
| Quick NPC build card                                                                                                                                                                                | `bg-sunken` variant             | Compliant                 |

### B. Master-detail placeholders

| Location                                                                                                                                                     | Pattern                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ |
| [`MasterDetailEditorEmptyState`](../../apps/dashboard/src/features/content/components/master-detail/master-detail-editor-empty-state.tsx)                    | Title lg + supporting lg |
| Species heritage empty ([`species-heritage-tab.variants.ts`](../../apps/dashboard/src/features/content/species/components/species-heritage-tab.variants.ts)) | Title lg + supporting    |

### Out of scope (copy-only / inline)

| Location                                                                                   | Reason                                                            |
| ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `IndexPageEmptyState`, messages workspace empties, `NotificationEmptyState`                | Page-level typography — no recessed container                     |
| Data table empty cell, spell resolution text-only empty, location connected-parties helper | Inline muted text                                                 |
| Fixed-scores DnD pool                                                                      | Interactive shell — keep `emphasis: 'subtle'`, not an empty state |

## Drift guard

[`empty-state-well.variants.test.ts`](../src/components/ui/empty-state-well.variants.test.ts) asserts shell + role classes stay on `bg-sunken`, passive message includes `italic`, and title/supporting stay roman. Do not add new dashboard-local bordered empty wells with ad-hoc `bg-background` / `bg-field-container` / `text-foreground` stacks.
