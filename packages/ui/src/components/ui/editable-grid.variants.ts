import { cva } from 'class-variance-authority'

export const editableGridTableVariants = cva('w-full min-w-max caption-bottom text-sm')

export const editableGridStickyHeaderVariants = cva(
  'sticky left-0 z-20 min-w-14 bg-background font-semibold text-foreground shadow-[1px_0_0_0_hsl(var(--border))]',
)

export const editableGridStickyCellVariants = cva(
  'sticky left-0 z-10 min-w-14 bg-background font-medium text-foreground shadow-[1px_0_0_0_hsl(var(--border))] group-hover:bg-muted/50',
)

export const editableGridDataCellVariants = cva('min-w-24 p-2')

export const editableGridHeaderCellVariants = cva('min-w-24 text-center')

export const editableGridColumnHeaderVariants = cva('flex flex-col items-center gap-1')
