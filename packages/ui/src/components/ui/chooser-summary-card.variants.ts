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

/** Clickable selected value — same action as the Change link. */
export const chooserSummaryCardTitleButtonClasses =
  'cursor-pointer border-0 bg-transparent p-0 text-left transition-colors hover:text-foreground/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'

export const chooserSummaryCardDescriptionVariants = radioCardDescriptionVariants
