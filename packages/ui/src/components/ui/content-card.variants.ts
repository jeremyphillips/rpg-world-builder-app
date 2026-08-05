import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  controlActionCompactIconClasses,
  controlActionCompactTextClasses,
} from './control-action.variants'

/** Entity-owned density inset — shared by standalone and embedded chrome. */
export const contentCardDensityInsetVariants = cva('', {
  variants: {
    density: {
      compact: 'px-4 py-3',
      comfortable: 'px-5 py-3',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

export const contentCardRootVariants = cva('rounded-md', {
  variants: {
    density: {
      compact: 'px-4 py-3',
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

export const contentCardBodyVariants = cva('flex min-w-0 w-full gap-3', {
  variants: {
    rowAlign: {
      start: 'items-start',
      center: 'items-center',
    },
  },
  defaultVariants: {
    rowAlign: 'start',
  },
})

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
        comfortable: 'text-base',
      },
    },
    defaultVariants: {
      density: 'comfortable',
    },
  },
)

export const contentCardSubheadingVariants = cva('truncate text-muted-foreground', {
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

export const contentCardMetadataVariants = cva('truncate text-muted-foreground', {
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

export const contentCardIconActionVariants = cva(
  cn(
    'inline-flex shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-control-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    controlActionCompactIconClasses,
  ),
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

export const contentCardMediaVariants = cva('size-10 shrink-0 rounded-md object-cover')

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
