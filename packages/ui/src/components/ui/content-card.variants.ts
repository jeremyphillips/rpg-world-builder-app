import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { cardDensityClassName, UI_CONTENT_CARD_INSET_CLASS } from './card.variants'
import { resolveCompactControlRecipeClasses } from './compact-control.styles'

/** @deprecated Prefer {@link cardDensityClassName} + {@link UI_CONTENT_CARD_INSET_CLASS}. */
export const contentCardDensityInsetVariants = cva('', {
  variants: {
    density: {
      compact: cn(cardDensityClassName('compact'), UI_CONTENT_CARD_INSET_CLASS),
      comfortable: cn(cardDensityClassName('comfortable'), UI_CONTENT_CARD_INSET_CLASS),
      spacious: cn(cardDensityClassName('spacious'), UI_CONTENT_CARD_INSET_CLASS),
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const contentCardRootVariants = cva('w-full min-w-0 rounded-md', {
  variants: {
    chrome: {
      standalone: 'border border-border',
      embedded: '',
    },
  },
  defaultVariants: {
    chrome: 'standalone',
  },
})

/** Horizontal gap between identity media and summary column — shared by card body and embedded anatomy. */
export const contentCardIdentityColumnGapVariants = cva('', {
  variants: {
    density: {
      compact: 'gap-2',
      comfortable: 'gap-4',
      spacious: 'gap-4',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/**
 * Compact image→copy is 16px: the row `gap-2` (8px) plus this margin.
 * Comfortable `gap-4` is already 16px, so it adds nothing. End-slot spacing stays the row gap.
 */
export const contentCardMediaEndGapVariants = cva('', {
  variants: {
    density: {
      compact: 'me-2',
      comfortable: '',
      spacious: '',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export function resolveContentCardIdentityColumnGapClasses(
  density: ContentCardDensity = 'comfortable',
): string {
  return contentCardIdentityColumnGapVariants({ density })
}

export const contentCardBodyVariants = cva('flex min-w-0 w-full', {
  variants: {
    density: {
      compact: resolveContentCardIdentityColumnGapClasses('compact'),
      comfortable: resolveContentCardIdentityColumnGapClasses('comfortable'),
      spacious: resolveContentCardIdentityColumnGapClasses('spacious'),
    },
    crossAxis: {
      top: 'items-start',
      center: 'items-center',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    crossAxis: 'top',
  },
})

/** Top-align media/end slot when secondary lines exist; center on heading-only rows. */
export function resolveContentCardBodyCrossAxis(hasSecondaryText: boolean): 'top' | 'center' {
  return hasSecondaryText ? 'top' : 'center'
}

export const contentCardHeadingRowVariants = cva('flex min-w-0 items-center gap-2', {
  variants: {
    rhythm: {
      none: '',
      secondary: 'mb-1',
    },
  },
  defaultVariants: {
    rhythm: 'none',
  },
})

export function contentCardHeadingScaleClass(density?: ContentCardDensity): string {
  return cn(
    'ui-content-card-heading ui-copy-title',
    density === 'compact' && 'ui-content-card-heading--compact',
    density === 'comfortable' && 'ui-content-card-heading--comfortable',
    density === 'spacious' && 'ui-content-card-heading--spacious',
  )
}

/** Layer-2 supporting copy density — shared by content-card and entity summary surfaces. */
export const supportingTextDensityVariants = cva('truncate text-muted-foreground', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
      spacious: 'text-sm',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const contentCardSubheadingVariants = supportingTextDensityVariants

export const contentCardMetadataVariants = supportingTextDensityVariants

/** Heading-row actions stay compact regardless of card density. Link actions use pr-0. */
export const contentCardHeadingActionVariants = cva(
  cn(
    'inline-flex shrink-0 items-center rounded-sm pl-2 pr-0 text-sm text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    resolveCompactControlRecipeClasses('text-compact', { includeBlock: false }),
  ),
)

/** Linked entity headings — link color only; no hover underline. */
export const contentCardHeadingLinkVariants = cva('text-link')

/** @deprecated Prefer {@link IdentityFrame} via {@link ContentCardMedia}. */
export const contentCardMediaVariants = cva('shrink-0', {
  variants: {
    density: {
      compact: '',
      comfortable: '',
      spacious: '',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const CONTENT_CARD_DENSITIES = ['compact', 'comfortable', 'spacious'] as const
export type ContentCardDensity = (typeof CONTENT_CARD_DENSITIES)[number]
export type ContentCardChrome = NonNullable<VariantProps<typeof contentCardRootVariants>['chrome']>

export function resolveContentCardDensityInsetClasses(density: ContentCardDensity): string {
  return cn(cardDensityClassName(density), UI_CONTENT_CARD_INSET_CLASS)
}

/** @deprecated Use {@link ContentCardChrome} — `outline` maps to `standalone`, `ghost` to `embedded`. */
export type ContentCardSurface = 'outline' | 'card' | 'ghost'
export type ContentCardHeadingRowRhythm = NonNullable<
  VariantProps<typeof contentCardHeadingRowVariants>['rhythm']
>
