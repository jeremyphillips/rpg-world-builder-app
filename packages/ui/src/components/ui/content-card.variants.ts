import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { controlActionCompactTextClasses } from './control-action.variants'
import { iconGhostControlVariants } from './icon-ghost-control.variants'

/** Entity-owned density inset — shared by standalone and embedded chrome. */
export const contentCardDensityInsetVariants = cva('', {
  variants: {
    density: {
      compact: 'px-3 py-2',
      comfortable: 'px-5 py-3',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const contentCardRootVariants = cva('w-full min-w-0 rounded-md', {
  variants: {
    density: {
      compact: 'px-3 py-2',
      comfortable: 'px-5 py-3',
    },
    chrome: {
      standalone: 'border border-border',
      embedded: '',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    chrome: 'standalone',
  },
})

/** Horizontal gap between identity media and summary column — shared by card body and embedded anatomy. */
export const contentCardIdentityColumnGapVariants = cva('', {
  variants: {
    density: {
      compact: 'gap-2',
      comfortable: 'gap-4',
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
      withHeadingEndSlot: 'mb-0',
    },
  },
  defaultVariants: {
    rhythm: 'none',
  },
})

export const contentCardHeadingVariants = cva(
  'truncate font-body-emphasis [&_a]:block [&_a]:min-w-0 [&_a]:truncate',
  {
    variants: {
      density: {
        compact: 'text-sm',
        comfortable: 'entity-card-heading-comfortable',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

export const contentCardMixedHeadingRowVariants = cva('flex min-w-0 items-baseline gap-x-1', {
  variants: {
    density: {
      compact: 'text-sm',
      comfortable: 'entity-card-heading-comfortable',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const contentCardMixedHeadingNameVariants = cva(
  'min-w-0 shrink truncate font-body-emphasis text-foreground [&_a]:truncate',
)

export const contentCardMixedHeadingSeparatorVariants = cva(
  'shrink-0 font-normal text-muted-foreground',
)

export const contentCardMixedHeadingSuffixVariants = cva(
  'shrink-0 font-normal text-muted-foreground',
)

/** Layer-2 supporting copy density — shared by content-card and entity summary surfaces. */
export const supportingTextDensityVariants = cva('truncate text-muted-foreground', {
  variants: {
    density: {
      compact: 'text-xs',
      comfortable: 'text-sm',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const contentCardSubheadingVariants = supportingTextDensityVariants

export const contentCardMetadataVariants = supportingTextDensityVariants

export const contentCardIconActionVariants = cva(
  iconGhostControlVariants({ hover: 'accent', layout: 'inline' }),
)

export const contentCardRemoveButtonVariants = cva(
  iconGhostControlVariants({ hover: 'destructive', layout: 'inline' }),
)

/** Heading-row actions stay compact regardless of card density. Link actions use pr-0. */
export const contentCardHeadingActionVariants = cva(
  cn(
    'inline-flex shrink-0 items-center rounded-sm pl-2 pr-0 text-sm text-link focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    controlActionCompactTextClasses,
  ),
)

export const contentCardHeadingEndSlotVariants = cva('shrink-0 text-sm')

/** Linked entity headings — link color only; no hover underline. */
export const contentCardHeadingLinkVariants = cva('text-link')

/** @deprecated Prefer {@link IdentityFrame} via {@link ContentCardMedia}. */
export const contentCardMediaVariants = cva('shrink-0', {
  variants: {
    density: {
      compact: '',
      comfortable: '',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export type ContentCardDensity = NonNullable<
  VariantProps<typeof contentCardRootVariants>['density']
>
export type ContentCardChrome = NonNullable<VariantProps<typeof contentCardRootVariants>['chrome']>

export function resolveContentCardDensityInsetClasses(density: ContentCardDensity): string {
  return contentCardDensityInsetVariants({ density })
}

/** @deprecated Use {@link ContentCardChrome} — `outline` maps to `standalone`, `ghost` to `embedded`. */
export type ContentCardSurface = 'outline' | 'card' | 'ghost'
export type ContentCardHeadingRowRhythm = NonNullable<
  VariantProps<typeof contentCardHeadingRowVariants>['rhythm']
>
