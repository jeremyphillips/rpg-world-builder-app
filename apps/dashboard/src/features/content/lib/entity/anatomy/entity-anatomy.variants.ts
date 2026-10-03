import { cva } from 'class-variance-authority'

import { cn, rowAnatomyTracksVariants, type ContentCardDensity, type RowAnatomyBand } from '@rpg/ui'

/** Embedded EntityAnatomyHost host — anatomy only; collection inset owned by the host. */
export const entityAnatomyHostRootVariants = cva('w-full min-w-0')

/**
 * Column template — EntityAnatomy owns columns and horizontal spacing; RowAnatomy owns rows.
 * Empty `auto` columns collapse to 0, so absent rails add no phantom spacing.
 * Media → content gap mirrors `contentCardIdentityColumnGapVariants`; the leading content
 * gap lives on EntityLeadingRail padding-inline-end.
 */
export const entityAnatomyColumnsVariants = cva(
  'min-w-0 w-full grid-cols-[[leading]_auto_[media]_auto_[content]_minmax(0,1fr)_[trailing]_auto] [&>[data-row-anatomy-column=trailing]]:justify-self-end',
  {
    variants: {
      density: {
        compact:
          '[&>[data-row-anatomy-column=media]]:me-2 [&>[data-row-anatomy-column=trailing]]:ms-2',
        comfortable:
          '[&>[data-row-anatomy-column=media]]:me-4 [&>[data-row-anatomy-column=trailing]]:ms-3',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

export function entityAnatomyVariants({
  density = 'comfortable',
  band = 'control',
}: { density?: ContentCardDensity; band?: RowAnatomyBand } = {}) {
  return cn(rowAnatomyTracksVariants({ band }), entityAnatomyColumnsVariants({ density }))
}
