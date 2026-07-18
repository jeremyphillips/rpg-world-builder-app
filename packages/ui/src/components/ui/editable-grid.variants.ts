import { cva } from 'class-variance-authority'

/** Compact column width for level labels and numeric/select cells (~70px). */
const COMPACT_COL = 'w-[70px] max-w-[70px]'

export const editableGridTableVariants = cva('table-fixed w-auto caption-bottom text-sm')

export const editableGridStickyHeaderVariants = cva(
  `sticky left-0 z-20 ${COMPACT_COL} bg-background px-2 text-center font-semibold text-foreground shadow-[1px_0_0_0_hsl(var(--border))]`,
)

export const editableGridStickyCellVariants = cva(
  `sticky left-0 z-10 ${COMPACT_COL} bg-background px-2 text-center font-medium text-foreground shadow-[1px_0_0_0_hsl(var(--border))] group-hover:bg-row-hover`,
)

export const editableGridDataCellVariants = cva(`${COMPACT_COL} p-2 text-center`)

export const editableGridHeaderCellVariants = cva(`${COMPACT_COL} px-2 text-center align-top`)

export const editableGridColumnHeaderVariants = cva(
  'flex flex-col items-center gap-1 text-xs leading-tight',
)

/** Fills the fixed-width table cell without growing the column. */
export const editableGridControlVariants = cva('w-full min-w-0')
