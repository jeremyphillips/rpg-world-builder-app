import { cva } from 'class-variance-authority'

import {
  identityFrameFallbackIconClasses,
  identityFrameFitClasses,
  identityFrameShapeClasses,
  identityFrameSizeClasses,
} from './identity-frame-tokens.variants'

export const identityFrameVariants = cva('relative shrink-0 overflow-hidden', {
  variants: {
    shape: identityFrameShapeClasses,
    size: identityFrameSizeClasses,
  },
  defaultVariants: {
    shape: 'box',
    size: 'sm',
  },
})

export const identityFrameImageVariants = cva('block size-full max-w-none select-none', {
  variants: {
    fit: identityFrameFitClasses,
  },
  defaultVariants: {
    fit: 'cover',
  },
})

export const identityFrameFallbackVariants = cva(
  'flex size-full items-center justify-center bg-surface-strong text-muted-foreground',
  {
    variants: {
      size: {
        xs: identityFrameFallbackIconClasses.xs,
        sm: identityFrameFallbackIconClasses.sm,
        md: identityFrameFallbackIconClasses.md,
        inline: identityFrameFallbackIconClasses.inline,
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  },
)

/** Heading-band min-height aligned to inset-row frame sizes. */
export const identityHeadingBandVariants = cva('flex min-w-0 items-center', {
  variants: {
    density: {
      compact: 'min-h-8',
      comfortable: 'min-h-10',
    },
  },
  defaultVariants: {
    density: 'comfortable',
  },
})

/** Inset-row geometry — content-column gap and vertical alignment. */
export const identityInsetRowVariants = cva('flex min-w-0', {
  variants: {
    density: {
      compact: 'gap-2',
      comfortable: 'gap-3',
    },
    align: {
      start: 'items-start',
      center: 'items-center',
    },
  },
  defaultVariants: {
    density: 'comfortable',
    align: 'start',
  },
})
