import { cva, type VariantProps } from 'class-variance-authority'

export const contentStatRowVariants = cva('font-body-emphasis', {
  variants: {
    size: {
      default: 'text-md',
      sm: 'text-sm',
    },
    layout: {
      inline: '',
      hero: '',
    },
  },
  defaultVariants: {
    size: 'default',
    layout: 'inline',
  },
})

export const contentStatRowLabelVariants = cva(
  'inline-flex items-center gap-1 font-body-emphasis',
  {
    variants: {
      size: {
        default: 'text-md',
        sm: 'text-sm',
      },
      layout: {
        inline: '',
        // Shrink-wrap the key so measurement reads text width, not the stretched grid cell.
        hero: 'w-max justify-self-start text-foreground',
      },
    },
    defaultVariants: {
      size: 'default',
      layout: 'inline',
    },
  },
)

export const contentStatRowValueVariants = cva(
  'inline-flex items-center gap-1 text-muted-foreground',
  {
    variants: {
      size: {
        default: 'text-md',
        sm: 'text-sm',
      },
      layout: {
        inline: '',
        hero: 'min-w-0 text-left',
      },
    },
    defaultVariants: {
      size: 'default',
      layout: 'inline',
    },
  },
)

/** Single grid so value cells share one alignment column across rows within a group. */
export const contentDetailStatRowsGridClasses =
  'grid h-fit auto-rows-auto grid-cols-[var(--content-detail-stat-label-col,auto)_minmax(0,1fr)] content-start items-baseline gap-x-6 gap-y-2'

/**
 * Flex host — groups wrap on their intrinsic width.
 * `gap-y-2` (8px) matches the grid row gap so a wrapped pair keeps the same rhythm.
 */
export const contentDetailStatRowsHostClasses = 'flex flex-wrap items-start gap-x-12 gap-y-2'

/** One intrinsic-width metadata group. `flex-none` keeps the pair from squashing before it wraps. */
export const contentDetailStatRowsGroupClasses = 'h-fit w-max max-w-full flex-none'

/**
 * Vertical rule centered in the host `gap-x-12` (48px) after a group — pseudo-element avoids flex width churn.
 * @see stat-row-group-layout.constants STAT_ROW_GROUP_DIVIDER_INSET_FROM_TRAILING_EDGE
 */
export const contentDetailStatRowsGroupTrailingDividerClasses =
  'relative before:pointer-events-none before:absolute before:inset-y-0 before:-right-[var(--content-detail-stat-divider-inset,1.5rem)] before:w-px before:bg-border-subtle'

export type ContentStatRowSize = NonNullable<VariantProps<typeof contentStatRowVariants>['size']>
export type ContentStatRowLayout = NonNullable<
  VariantProps<typeof contentStatRowVariants>['layout']
>
