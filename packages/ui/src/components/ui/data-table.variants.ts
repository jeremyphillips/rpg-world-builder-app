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
