import { cva } from 'class-variance-authority'

export const FILTER_SELECT_ALL_VALUE = '__all__'

/** Primary filter bar row — inline controls and trailing actions. */
export const filterBarVariants = cva('flex flex-wrap items-center gap-2')

/** Group of primary filter controls. */
export const filterBarFieldGroupVariants = cva('flex flex-1 flex-wrap items-center gap-2')

/** Single filter control width constraints. */
export const filterBarControlVariants = cva('', {
  variants: {
    type: {
      text: 'min-w-[180px] max-w-[260px] flex-1',
      select: 'min-w-[140px] max-w-[200px]',
      boolean: 'flex items-center gap-1.5',
      inlineSelect: 'min-w-[140px] max-w-[200px]',
      chips: '',
      popover: '',
    },
  },
})

export const filterBarResetButtonClasses = 'gap-1 text-xs [&_svg]:size-3'

export const filterBarInlineFieldGroupClasses =
  'flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2'

export const filterBarInlineFieldLabelClasses = 'text-sm text-muted-foreground'

/** Collapsible advanced-filters panel shell. */
export const filterAdvancedPanelVariants = cva(
  'overflow-hidden rounded-md border border-border bg-surface-muted',
)

/** Inner grid for advanced filter controls. */
export const filterAdvancedPanelInnerVariants = cva('grid gap-3 p-4', {
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
