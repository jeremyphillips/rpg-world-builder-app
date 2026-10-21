import { cn, establishSurfaceCurrent } from '@rpg/ui'

/** Builder / workflow collection host — border frame only (no panel wash). */
export const collectionPanelShellClasses = 'overflow-hidden rounded-md border border-border-subtle'

/** Equipment inventory host — legacy `rounded-lg` radius preserved. */
export const equipmentCollectionPanelShellClasses =
  'overflow-hidden rounded-lg border border-border'

/** Builder choice wells and similar collection panels. */
export const collectionPanelComfortableInsetClasses = 'px-4 py-4'

/** Nested editor / ledger inset inside a collection host. */
export const collectionPanelNestedBodyClasses = cn(
  'flex flex-col rounded-md border border-border bg-surface-faint p-3',
  establishSurfaceCurrent('surface-faint'),
)

/** Read-only ledger under a section heading (picker inventory summary). */
export const collectionPanelLedgerBodyClasses = cn(
  'rounded-md border border-border bg-surface-subtle px-3 py-2',
  establishSurfaceCurrent('surface-subtle'),
)

/** NPC quick-create setup attribute panel (`surface-lift`). */
export const collectionPanelLiftShellClasses =
  'flex flex-col gap-y-4 rounded-md border border-border bg-surface-lift px-3 py-3'

/** Modal budget / summary inset. */
export const collectionPanelMutedSummaryClasses =
  'rounded-lg border border-border bg-surface-muted px-4 py-3'

/** Declined-package empty state — transparent panel with card lift on content band. */
export const collectionPanelEmptyStateBodyClasses =
  'flex flex-col items-start gap-2 rounded-md border border-border bg-card p-3'
