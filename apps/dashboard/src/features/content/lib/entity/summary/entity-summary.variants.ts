import { cva } from 'class-variance-authority'

import { supportingTextDensityVariants } from '@rpg/ui'

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

export const entitySummaryDescriptionVariants = supportingTextDensityVariants

export const entitySummaryStatusVariants = supportingTextDensityVariants

export const entityItemStatusRowVariants = cva('mt-1 flex min-w-0 flex-wrap gap-x-2 gap-y-1')
