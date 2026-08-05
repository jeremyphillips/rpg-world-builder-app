import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import {
  controlActionCompactIconClasses,
  controlActionCompactTextClasses,
} from './control-action.variants'

export const contentCardRootVariants = cva('flex gap-3 rounded-md', {
  variants: {
    density: {
      compact: 'px-4 py-3',
      comfortable: 'px-5 py-3',
    },
    surface: {
      outline: 'border border-border',
      card: 'border border-border bg-card',
      ghost: '',
    },
    rowAlign: {
      start: 'items-start',
      center: 'items-center',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    surface: 'outline',
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
export type ContentCardSurface = NonNullable<
  VariantProps<typeof contentCardRootVariants>['surface']
>
export type ContentCardHeadingRowRhythm = NonNullable<
  VariantProps<typeof contentCardHeadingRowVariants>['rhythm']
>
