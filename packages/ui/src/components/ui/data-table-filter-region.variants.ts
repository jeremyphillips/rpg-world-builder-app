import { cva } from 'class-variance-authority'

/** Filter region layout — primary panel row and optional additional panel row. */
export const dataTableFilterRegionVariants = cva('grid w-full gap-y-3')

/** Primary filter panel shell — faint background wrapping fields and optional trigger. */
export const dataTableFilterRegionPrimaryVariants = cva(
  'min-w-0 rounded-md border border-border bg-surface-subtle p-3',
)

/** Inner layout — grid pins More filters top-right; flex-only when no trigger. */
export const dataTableFilterRegionPrimaryInnerVariants = cva('min-w-0', {
  variants: {
    hasTrigger: {
      true: 'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3 max-sm:grid-cols-1',
      false: 'flex flex-wrap items-end gap-3',
    },
  },
  defaultVariants: {
    hasTrigger: false,
  },
})

/** Primary filter field group — wraps inside the left grid column. */
export const dataTableFilterRegionPrimaryFieldsVariants = cva(
  'flex min-w-0 flex-wrap items-end gap-3',
)

/** More filters trigger — top-right column, aligned with the first control row. */
export const dataTableFilterRegionTriggerWrapVariants = cva('shrink-0 max-sm:justify-self-end')

/** Stacked label + control band — mirrors primary stacked filter field anatomy. */
export const dataTableFilterRegionRailStackVariants = cva('flex flex-col max-sm:gap-0', {
  variants: {
    density: {
      compact: 'gap-0.5',
      comfortable: 'gap-1',
    },
  },
  defaultVariants: {
    density: 'compact',
  },
})

/** Invisible label row reserving space above the More filters control band. */
export const dataTableFilterRegionLabelSpacerVariants = cva(
  'invisible block leading-none max-sm:hidden',
  {
    variants: {
      density: {
        compact: 'text-xs',
        comfortable: 'text-sm',
      },
    },
    defaultVariants: {
      density: 'compact',
    },
  },
)

/** Additional filters panel row below the primary panel. */
export const dataTableFilterRegionPanelRowVariants = cva('min-w-0')

/** More filters trigger button. */
export const dataTableFilterRegionTriggerVariants = cva('gap-1.5')
