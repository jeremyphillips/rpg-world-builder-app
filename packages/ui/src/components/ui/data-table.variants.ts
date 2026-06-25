import { cva } from 'class-variance-authority'

/** Outer wrapper for the entire DataTable — stacks toolbar, table, and pagination. */
export const dataTableRootVariants = cva('flex flex-col gap-3 w-full')

/** Toolbar row — primary filter strip + column toggle. */
export const dataTableToolbarVariants = cva('flex flex-wrap items-center gap-2')

/** Container for the group of inline filter controls on the left of the toolbar. */
export const dataTableFilterGroupVariants = cva('flex flex-1 flex-wrap items-center gap-2')

/** A single filter control wrapper (constrains width). */
export const dataTableFilterControlVariants = cva('', {
  variants: {
    type: {
      text: 'min-w-[180px] max-w-[260px] flex-1',
      select: 'min-w-[140px] max-w-[200px]',
      boolean: 'flex items-center gap-1.5',
    },
  },
})

/** Collapsible advanced-filters panel border + padding. */
export const dataTableAdvancedPanelVariants = cva(
  'overflow-hidden rounded-md border border-border bg-muted/30',
)

/** Inner grid for secondary filter controls. */
export const dataTableAdvancedInnerVariants = cva('grid gap-3 p-4', {
  variants: {
    cols: {
      1: 'grid-cols-1',
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    },
  },
  defaultVariants: { cols: 3 },
})

/** Pagination row — spaced between count label and page controls. */
export const dataTablePaginationVariants = cva(
  'flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground',
)

/** Table container with border + rounded corners. */
export const dataTableTableWrapVariants = cva('rounded-md border border-border')

/**
 * Table element — below `lg`, keep natural column widths and scroll horizontally
 * instead of crushing fixed-width columns (e.g. thumbnails). At `lg+`, allow the
 * table to shrink to the container when there is enough room.
 */
export const dataTableTableVariants = cva('min-w-max lg:min-w-0')

/** Popover panel for the column visibility / order editor. */
export const dataTableColumnPanelVariants = cva(
  'z-50 w-[240px] overflow-hidden rounded-md border border-border bg-popover p-0 shadow-md',
)

/** A single row inside the column panel list. */
export const dataTableColumnItemVariants = cva(
  'flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground',
)

/** The drag handle button inside a column panel row. */
export const dataTableColumnDragHandleVariants = cva(
  'flex cursor-grab items-center rounded p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing',
)

/** Empty table body cell copy. */
export const dataTableEmptyStateVariants = cva('h-24 text-center text-muted-foreground')

/** Empty column panel search result. */
export const dataTableEmptyPanelVariants = cva('px-3 py-2 text-sm text-muted-foreground')

/** Locked (always-visible) column row in the panel. */
export const dataTableLockedColumnVariants = cva(
  'flex cursor-default items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground',
)

/** Reset column order control in the panel footer. */
export const dataTableResetColumnVariants = cva(
  'flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
)

/** Active filter chip dismiss control in the toolbar. */
export const dataTableFilterChipVariants = cva(
  'inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground',
)
