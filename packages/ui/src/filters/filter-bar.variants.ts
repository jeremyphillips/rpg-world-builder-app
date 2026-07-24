import { cva } from 'class-variance-authority'

import type { FilterDensity } from './filter-schema.types'

export const FILTER_SELECT_ALL_VALUE = '__all__'

export const FILTER_DENSITY_DEFAULT: FilterDensity = 'compact'

/** Primary filter bar row — control-edge alignment with trailing actions. */
export const filterBarVariants = cva('flex flex-wrap items-end gap-2')

/** Group of primary filter controls — control-edge baseline. */
export const filterBarFieldGroupVariants = cva('flex flex-1 flex-wrap items-end gap-2')

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

export const filterInlineFieldGroupVariants = cva('flex flex-col sm:flex-row sm:items-center', {
  variants: {
    density: {
      compact: 'gap-1 sm:gap-2',
      comfortable: 'gap-1 sm:gap-2',
    },
  },
  defaultVariants: { density: FILTER_DENSITY_DEFAULT },
})

export const filterFieldLabelVariants = cva('text-muted-foreground', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
  },
  defaultVariants: { density: FILTER_DENSITY_DEFAULT },
})

/** Label above control — used with `layout: 'stacked'` in inline field rows. */
export const filterStackedFieldGroupVariants = cva('flex flex-col', {
  variants: {
    density: {
      compact: 'gap-0.5',
      comfortable: 'gap-1',
    },
  },
  defaultVariants: { density: FILTER_DENSITY_DEFAULT },
})

/** Collapsible advanced-filters panel shell. */
export const filterAdvancedPanelVariants = cva(
  'overflow-hidden rounded-md border border-border bg-surface-muted',
)

/** Inline row for advanced filter controls. */
export const filterAdvancedPanelInnerVariants = cva('flex flex-wrap items-end', {
  variants: {
    density: {
      compact: 'gap-x-4 gap-y-2 p-3',
      comfortable: 'gap-x-6 gap-y-3 p-4',
    },
  },
  defaultVariants: { density: FILTER_DENSITY_DEFAULT },
})

export const filterAdvancedPanelFooterVariants = cva('border-t border-border', {
  variants: {
    density: {
      compact: 'px-3 py-2',
      comfortable: 'px-4 py-3',
    },
  },
  defaultVariants: { density: FILTER_DENSITY_DEFAULT },
})
