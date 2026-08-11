import { cva } from 'class-variance-authority'

import { supportingTextDensityVariants } from '@rpg/ui'

/** Embedded EntityItem host — anatomy only; collection inset owned by the host. */
export const entityItemRootVariants = cva('w-full min-w-0')

export const entityItemAnatomyVariants = cva(
  'grid min-w-0 w-full grid-cols-[auto_minmax(0,1fr)_auto]',
  {
    variants: {
      density: {
        compact: 'gap-y-1',
        comfortable: 'gap-y-1',
      },
      rowAlign: {
        start: 'items-start',
        center: 'items-center',
      },
    },
    defaultVariants: {
      density: 'comfortable',
      rowAlign: 'start',
    },
  },
)

/** Leading rail track — contentGap lives on EntityLeadingRail padding-inline-end. */
export const entityItemLeadingSlotVariants = cva('col-start-1 row-start-1 min-w-0')

/** Content track — always column 2 so summary owns the flexible column. */
export const entityItemContentVariants = cva('col-start-2 row-start-1 flex min-w-0', {
  variants: {
    density: {
      compact: 'gap-2',
      comfortable: 'gap-3',
    },
    rowAlign: {
      start: 'items-start',
      center: 'items-center',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    rowAlign: 'start',
  },
})

/** Trailing rail track — only rendered when `trailing` is set. */
export const entityItemTrailingSlotVariants = cva(
  'col-start-3 row-start-1 min-w-0 justify-self-end',
  {
    variants: {
      density: {
        compact: 'ml-2',
        comfortable: 'ml-3',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

export const entitySummaryDescriptionVariants = supportingTextDensityVariants

export const entitySummaryStatusVariants = supportingTextDensityVariants

export const entityItemStatusRowVariants = cva('flex min-w-0 flex-wrap gap-x-2 gap-y-1')
