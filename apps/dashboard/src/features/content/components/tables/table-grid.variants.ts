/** Compact column width for sticky row headers (~70px) — matches editable-grid. */
const TABLE_GRID_COMPACT_COL = 'w-[70px] max-w-[70px]'

const tableGridTableBaseClasses = 'table-fixed caption-bottom text-sm'

/** Default table shell — intrinsic width with horizontal scroll when needed. */
export const tableGridTableClasses = `${tableGridTableBaseClasses} w-auto`

/** Embedded preview tables stretch to the preview pane width. */
export const tableGridEmbeddedTableClasses = `${tableGridTableBaseClasses} w-full`

export const tableGridHeaderCellClasses = 'text-center font-medium'
export const tableGridRowHeaderCellClasses = `sticky left-0 z-10 ${TABLE_GRID_COMPACT_COL} bg-background px-2 text-center font-medium text-foreground shadow-[1px_0_0_0_var(--border)]`
export const tableGridRowHeaderHeaderClasses = `sticky left-0 z-20 ${TABLE_GRID_COMPACT_COL} bg-background px-2 text-center font-semibold text-foreground shadow-[1px_0_0_0_var(--border)]`
export const tableGridValueCellClasses = `${TABLE_GRID_COMPACT_COL} p-2 text-center`
export const tableGridEmptyBodyCellClasses = 'py-6 text-center text-sm text-muted-foreground'
