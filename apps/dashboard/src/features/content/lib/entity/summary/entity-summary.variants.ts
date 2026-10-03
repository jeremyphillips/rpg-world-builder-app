import { cva } from 'class-variance-authority'

import { supportingTextDensityVariants } from '@rpg/ui'

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

export const entitySummaryStatusVariants = supportingTextDensityVariants

/** Status items wrap within the lane; the row-anatomy status cell owns the top offset. */
export const entitySummaryStatusRowVariants = cva('flex min-w-0 flex-wrap gap-x-2 gap-y-1')
