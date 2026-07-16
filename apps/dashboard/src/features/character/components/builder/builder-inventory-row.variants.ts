import { cva } from 'class-variance-authority'

export const builderInventoryRowVariants = cva('', {
  variants: {
    variant: {
      card: 'flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3',
      dense: 'py-2',
    },
  },
  defaultVariants: {
    variant: 'card',
  },
})

export const builderInventoryRowHeaderClasses = 'flex items-start justify-between gap-3'

export const builderInventoryRowContentClasses = 'min-w-0 space-y-1'

export const builderInventoryRowNameClasses = 'font-body-emphasis text-foreground'

export const builderInventoryRowProvenanceClasses = 'text-xs text-muted-foreground'

export const builderInventoryRowFooterClasses =
  'mt-2 flex flex-wrap items-center justify-between gap-3'

export const builderInventoryRowMetaClasses = 'flex flex-wrap items-center gap-2'

export const builderInventoryRowSourceClasses = 'text-muted-foreground'

export const builderInventoryRowActionsClasses = 'flex flex-wrap items-center gap-2'

export const builderInventoryRowRemoveButtonClasses =
  'flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export const builderInventoryRowDenseRemoveButtonClasses =
  'flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

/** @deprecated Use {@link builderInventoryRowVariants} with `variant: 'card'`. */
export const builderInventoryRowClasses = builderInventoryRowVariants({ variant: 'card' })
