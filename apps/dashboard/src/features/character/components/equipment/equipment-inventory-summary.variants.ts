export const equipmentInventorySummaryClasses = 'space-y-6'

export const equipmentInventorySummaryGridClasses =
  'grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start'

export const equipmentInventoryColumnClasses = 'flex min-w-0 flex-col space-y-3'

export const equipmentInventoryColumnHeaderClasses = 'space-y-1'

export const equipmentInventoryColumnTitleRowClasses =
  'flex flex-wrap items-center justify-between gap-2'

/** Inventory column title — 19px (`heading-style-subsection`). */
export const EQUIPMENT_INVENTORY_COLUMN_TITLE_VARIANT = 'subsection' as const

/** Matches toolbar row height so purchased column boxes align in the two-column grid. */
export const equipmentInventoryColumnToolbarClasses = 'flex min-h-5 flex-wrap items-center gap-x-1'

export const equipmentInventoryColumnToolbarSpacerClasses = 'min-h-5'

export const equipmentInventoryColumnToolbarLinkClasses = 'h-auto px-0 text-xs'

export const equipmentInventoryColumnToolbarSeparatorClasses = 'text-muted-foreground'

export const equipmentInventorySummaryGroupClasses = 'space-y-1'

export const equipmentInventorySummaryListClasses = ''

export const equipmentPurchasedInventoryCategoryListClasses =
  'divide-y divide-border overflow-visible'

export const equipmentPurchasedInventoryCategoryClasses = 'space-y-1 py-3 first:pt-0 last:pb-0'

/** Vertical spacing between inventory row cards in a category list. */
export const equipmentInventoryRowListClasses = 'flex flex-col gap-2 overflow-visible'

export const equipmentInventoryRowClasses = 'overflow-visible py-1'

export const equipmentInventoryRowQuantityClasses = 'flex items-center gap-1.5'

export const equipmentInventoryRowHeaderClasses = 'flex items-center justify-between gap-2'

export const equipmentInventoryRowActionsClasses = 'flex shrink-0 items-center'

export const equipmentInventoryRowDetailLineClasses = 'mt-0.5'

export const equipmentInventoryRowPriceLineClasses = 'min-w-0 text-muted-foreground opacity-80'

export const equipmentInventoryRowNameClasses = 'font-body-emphasis text-base text-foreground'

export const equipmentInventoryRowStagedRemovalNameClasses =
  'font-body-emphasis text-base text-muted-foreground line-through'

export const equipmentInventoryRowQtyLabelClasses = 'shrink-0 text-xs tabular-nums text-foreground'

export const equipmentInventoryRowRemoveButtonClasses =
  'mr-[-12px] flex size-8 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export {
  builderInventoryRowFooterClasses as equipmentInventoryRowFooterClasses,
  builderInventoryRowProvenanceClasses as equipmentInventoryRowProvenanceClasses,
} from '../builder/builder-inventory-row.variants'
