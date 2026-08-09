import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  radioCardCompactSummaryBodyLayoutClasses,
  radioCardCompactSummaryContentGapClasses,
  radioCardDensityBodyLayoutVariants,
  radioCardDensityContentGapVariants,
  radioCardDescriptionVariants,
  radioCardPrimaryCopyStackVariants,
  radioCardSummaryTitleVariants,
} from './radio-card.variants'

/** Selected summary shell — additive primary border/ring, not details-option shell chrome. */
export const chooserSummaryCardShellClasses =
  'w-full overflow-hidden rounded-card border border-border bg-card shadow-sm border-primary ring-1 ring-primary/20'

export const chooserSummaryCardBodyVariants = cva('flex flex-col', {
  variants: {
    density: {
      default: cn(
        radioCardDensityBodyLayoutVariants({ density: 'default' }),
        radioCardDensityContentGapVariants({ density: 'default' }),
      ),
      compact: cn(
        radioCardCompactSummaryBodyLayoutClasses,
        radioCardCompactSummaryContentGapClasses,
      ),
    },
  },
  defaultVariants: {
    density: 'default',
  },
})

export const chooserSummaryCardEyebrowRowClasses =
  'flex flex-wrap items-center justify-between gap-2'

export const chooserSummaryCardChangeLinkClasses = 'h-auto px-0 text-xs'

export const chooserSummaryCardPrimaryCopyVariants = radioCardPrimaryCopyStackVariants

export const chooserSummaryCardTitleVariants = radioCardSummaryTitleVariants

export const chooserSummaryCardDescriptionVariants = radioCardDescriptionVariants
