import { cva } from 'class-variance-authority'

import { cn } from '../lib/utils'
import { borderStrength } from '../components/ui/border-strength'
import { establishSurfaceCurrent } from '../components/ui/surface-current.lib'
import { fieldCaptionTypographyVariants } from '../components/ui/field-caption.variants'
import type { FilterDensity } from './filter-schema.types'

export const FILTER_SELECT_ALL_VALUE = '__all__'

/** Trigger copy when a floating select is on its all-value. Menu items keep the full label. */
export const FILTER_SELECT_ALL_TRIGGER_LABEL = 'All'

const FILTER_CAPTION_SIZE = {
  compact: 'sm',
  comfortable: 'md',
} as const satisfies Record<FilterDensity, 'sm' | 'md'>

/** Filter caption classes. Density maps onto {@link fieldCaptionTypographyVariants}. */
export function filterFieldLabelVariants(options?: { density?: FilterDensity | null }): string {
  const density = options?.density ?? FILTER_DENSITY_DEFAULT
  return fieldCaptionTypographyVariants({ size: FILTER_CAPTION_SIZE[density] })
}

export const FILTER_DENSITY_DEFAULT: FilterDensity = 'compact'

export type FilterBarOrientation = 'horizontal' | 'vertical'

export const filterBarVariants = cva('ui-filter-bar', {
  variants: {
    orientation: {
      horizontal: 'ui-filter-bar--horizontal',
      vertical: 'ui-filter-bar--vertical',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
})

export const filterBarControlVariants = cva('', {
  variants: {
    type: {
      text: 'ui-filter-bar__control--text',
      select: 'ui-filter-bar__control--select',
      selectLong: 'ui-filter-bar__control--select-long',
      boolean: 'ui-filter-bar__control--boolean',
      inlineSelect: 'ui-filter-bar__control--select',
      chips: '',
      popover: '',
    },
  },
})

export const filterStackedFieldGroupVariants = cva('ui-filter-bar__group--stacked', {
  variants: {
    density: {
      compact: 'ui-filter-bar__group--stacked-compact',
      comfortable: 'ui-filter-bar__group--stacked-comfortable',
    },
  },
  defaultVariants: { density: FILTER_DENSITY_DEFAULT },
})

export function filterAdvancedPanelClassName(): string {
  return cn(
    'ui-filter-advanced-panel',
    borderStrength('default'),
    establishSurfaceCurrent('surface-muted'),
  )
}

export const filterAdvancedPanelHeaderVariants = cva('ui-filter-advanced-panel__header', {
  variants: {
    density: {
      compact: 'ui-filter-advanced-panel__header--compact',
      comfortable: 'ui-filter-advanced-panel__header--comfortable',
    },
  },
  defaultVariants: { density: FILTER_DENSITY_DEFAULT },
})

export const filterAdvancedPanelInnerVariants = cva('ui-filter-advanced-panel__inner', {
  variants: {
    density: {
      compact: 'ui-filter-advanced-panel__inner--compact',
      comfortable: 'ui-filter-advanced-panel__inner--comfortable',
    },
  },
  defaultVariants: { density: FILTER_DENSITY_DEFAULT },
})

export const filterAdvancedPanelFooterVariants = cva(
  cn('ui-filter-advanced-panel__footer', borderStrength('subtle')),
  {
    variants: {
      density: {
        compact: 'ui-filter-advanced-panel__footer--compact',
        comfortable: 'ui-filter-advanced-panel__footer--comfortable',
      },
    },
    defaultVariants: { density: FILTER_DENSITY_DEFAULT },
  },
)
