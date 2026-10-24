export const editableGridTableVariants = 'table-fixed w-auto caption-bottom text-sm'

/** Compact column width for level labels and numeric/select cells (~70px). */

export const editableGridStickyHeaderVariants =
  'sticky left-0 z-20 w-[70px] max-w-[70px] bg-background px-2 text-center font-semibold text-foreground shadow-[1px_0_0_0_var(--border)]'

export const editableGridStickyCellVariants =
  'sticky left-0 z-10 w-[70px] max-w-[70px] bg-background px-2 text-center font-medium text-foreground shadow-[1px_0_0_0_var(--border)] group-hover:bg-row-hover'

export const editableGridDataCellVariants = 'w-[70px] max-w-[70px] p-2 text-center'

export const editableGridHeaderCellVariants = 'w-[70px] max-w-[70px] px-2 text-center align-top'

export const editableGridColumnHeaderVariants =
  'flex flex-col items-center gap-1 text-xs leading-tight'

/** Fills the fixed-width table cell without growing the column. */
export const editableGridControlVariants = 'w-full min-w-0'
