import { cva } from 'class-variance-authority'

/** Grid layout for the filter region — primary fields + optional trigger rail. */
export const dataTableFilterRegionVariants = cva('grid w-full gap-y-3', {
  variants: {
    hasTriggerRail: {
      true: 'grid-cols-[minmax(0,1fr)_auto] gap-x-3 max-sm:grid-cols-1',
      false: 'grid-cols-1',
    },
  },
  defaultVariants: {
    hasTriggerRail: false,
  },
})

/** Primary filter field group inside the region. */
export const dataTableFilterRegionPrimaryVariants = cva('flex min-w-0 flex-wrap items-end gap-3')

/** Full-height trigger rail column — aligns with the first control row. */
export const dataTableFilterRegionRailVariants = cva(
  'flex min-h-full flex-col max-sm:row-start-2 max-sm:items-end',
)

/** Decorative connector between trigger and panel — hidden on narrow screens. */
export const dataTableFilterRegionConnectorVariants = cva(
  'mx-auto min-h-3 flex-1 border-l border-border max-sm:hidden',
)

/** Panel row spanning both grid columns. */
export const dataTableFilterRegionPanelRowVariants = cva('col-span-2 max-sm:col-span-1')

/** More filters trigger button. */
export const dataTableFilterRegionTriggerVariants = cva('gap-1.5')
