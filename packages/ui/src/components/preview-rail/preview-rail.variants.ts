import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { cardSurfaceClasses } from '../ui/card.variants'
import { iconGlyphRootClasses } from '../ui/icon-glyph.variants'

export const previewRailRootVariants = cva('flex min-w-0 flex-col gap-4', {
  variants: {
    chrome: {
      card: cn('w-[21rem] max-w-[21rem] p-4', cardSurfaceClasses),
      plain: 'w-full',
    },
    sticky: {
      true: 'sticky self-start top-20',
      false: '',
    },
  },
  defaultVariants: {
    chrome: 'card',
    sticky: false,
  },
})

export const previewRailHeaderRowClasses = 'flex items-center justify-between gap-2'

export const previewRailIdentityRowClasses = 'flex items-center gap-3'

export const previewRailIdentityContentClasses = 'min-w-0 flex-1'

export const previewRailDividerClasses = 'border-t border-border'

export const previewRailMediaFallbackVariants = cva(
  'flex size-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground',
)

export const previewRailMediaIconClasses = iconGlyphRootClasses.lg

export const previewRailAvailabilityRowClasses =
  'mt-1 flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground'

export const previewRailAvailabilityInactiveIconClasses = cn(
  iconGlyphRootClasses.md,
  'shrink-0 text-semantic-warning',
)

export const previewRailAvailabilityDetailSeparatorClasses = 'text-muted-foreground'

export const previewRailFactsGridClasses =
  'grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-x-3 gap-y-2'

export const previewRailFactLabelClasses = 'text-sm text-muted-foreground'

export const previewRailFactValueClasses = 'text-sm text-foreground'

export const previewRailSectionsHeaderClasses = 'flex flex-col gap-1'

export const previewRailAccordionCardClasses =
  'overflow-hidden rounded-md border border-border bg-background'

export const previewRailAccordionItemClasses = 'border-b border-border last:border-b-0'

/** Tight inset for grouped-list accordion bodies (overrides default AccordionContent inner padding). */
export const previewRailAccordionContentClasses = '[&>div]:px-3 [&>div]:pb-3 [&>div]:pt-1'

export const previewRailSectionTriggerClasses =
  'flex flex-1 items-center justify-start gap-2 px-3 py-2.5 text-left text-sm font-body-emphasis hover:text-foreground/80 hover:no-underline'

export const previewRailSectionLabelClasses = 'min-w-0 shrink-0'

export const previewRailSectionStatusSpacerClasses = 'min-w-0 flex-1'

export const previewRailSectionMarkerClasses = iconGlyphRootClasses.md

export const previewRailSectionMarkerToneClasses = {
  complete: 'text-semantic-success',
  idle: 'text-muted-foreground',
  attention: 'text-semantic-warning',
} as const

export const previewRailSectionBodyClasses = 'flex flex-col gap-3 rounded-md bg-sunken p-3'

export const previewRailSectionBodyDescriptionClasses = 'line-clamp-3 text-sm text-muted-foreground'

export const previewRailStatusPanelIconClasses = cn(
  'mt-0.5 size-5 shrink-0',
  iconGlyphRootClasses.lg,
)

export const previewRailStatusPanelContentClasses = 'min-w-0 flex-1'

export const previewRailActionStackClasses = 'flex flex-col gap-2'

export const previewRailActionButtonClasses = 'w-full'

export type PreviewRailRootVariantProps = {
  chrome?: 'card' | 'plain'
  sticky?: boolean
}
