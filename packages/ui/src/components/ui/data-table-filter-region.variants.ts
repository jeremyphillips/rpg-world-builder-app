import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { filterBarVariants } from '../../filters/filter-bar.variants'
import { interactiveFocusVariants } from './interactive-focus.variants'
import { establishSurfaceCurrent } from './surface-current.lib'

/** Single filter panel — primary row, disclosure, and additional row share one shell. */
export const dataTableFilterRegionVariants = cva(
  cn(
    'flex w-full min-w-0 flex-col gap-3 rounded-md border border-border bg-surface-subtle p-3',
    establishSurfaceCurrent('surface-subtle'),
  ),
)

/** Primary field row. Divider only when an additional-filters disclosure is present. */
export const dataTableFilterRegionPrimaryRowVariants = cva('min-w-0', {
  variants: {
    divided: {
      true: 'border-b border-border pb-3',
      false: '',
    },
  },
  defaultVariants: {
    divided: false,
  },
})

/** Full-width disclosure row under the primary fields. */
export const dataTableFilterRegionDisclosureRowVariants = cva('flex min-w-0')

/** Inline disclosure trigger — chevron, label, optional active badge. */
export const dataTableFilterRegionDisclosureVariants = cva(
  cn(
    'inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-foreground',
    'hover:text-foreground/80',
    'disabled:pointer-events-none disabled:opacity-50',
    interactiveFocusVariants({ context: 'embedded' }),
  ),
)

/** Additional fields use the same wrap contract as the primary filter bar. */
export const dataTableFilterRegionAdditionalRowVariants = filterBarVariants
