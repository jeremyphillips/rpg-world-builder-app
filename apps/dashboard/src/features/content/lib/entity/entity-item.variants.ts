import { cva } from 'class-variance-authority'

import { supportingTextDensityVariants } from '@rpg/ui'

/** Embedded EntityItem host — anatomy only; collection inset owned by the host. */
export const entityItemRootVariants = cva('w-full min-w-0')

/** Grid cross-axis — top-aligned so rails pin to the heading band, not full summary height. */
export const entityItemAnatomyVariants = cva(
  'grid min-w-0 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start',
  {
    variants: {
      density: {
        compact: 'gap-y-1',
        comfortable: 'gap-y-1',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

/** Leading rail track — contentGap lives on EntityLeadingRail padding-inline-end. */
export const entityItemLeadingSlotVariants = cva('col-start-1 row-start-1 min-w-0')

/** Content track — always column 2 so summary owns the flexible column. */
export const entityItemContentVariants = cva('col-start-2 row-start-1 flex min-w-0 items-start', {
  variants: {
    density: {
      compact: 'gap-2',
      comfortable: 'gap-3',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/**
 * Heading band — compact-control height floor when leading/trailing chrome exists.
 * Secondary copy flows below; rails align to this band, not the full summary stack.
 */
export const entitySummaryHeadingBandVariants = cva(
  'flex min-w-0 min-h-control-action-compact items-center',
)

export const entitySummaryHeadingRowVariants = cva('flex min-w-0 flex-1 items-center gap-2')

export const entitySummaryHeadingEndValueVariants = cva(
  'shrink-0 tabular-nums font-body-emphasis text-muted-foreground',
  {
    variants: {
      density: {
        compact: 'text-sm',
        comfortable: 'text-base',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

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

export const entityItemStatusRowVariants = cva('mt-1 flex min-w-0 flex-wrap gap-x-2 gap-y-1')
