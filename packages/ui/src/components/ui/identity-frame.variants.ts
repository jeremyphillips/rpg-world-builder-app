import { cva } from 'class-variance-authority'

import {
  identityFrameFitClasses,
  identityFrameShapeClasses,
  identityFrameSizeClasses,
} from './identity-frame-tokens.variants'

export const identityFrameVariants = cva('ui-identity-frame', {
  variants: {
    shape: identityFrameShapeClasses,
    size: identityFrameSizeClasses,
  },
  defaultVariants: {
    shape: 'box',
    size: 'sm',
  },
})

export const identityFrameImageVariants = cva('ui-identity-frame__image', {
  variants: {
    fit: identityFrameFitClasses,
  },
  defaultVariants: {
    fit: 'cover',
  },
})

export const identityFrameFallbackVariants = cva('ui-identity-frame__fallback', {
  variants: {
    size: {
      xs: 'ui-identity-frame__fallback--xs',
      sm: 'ui-identity-frame__fallback--sm',
      md: 'ui-identity-frame__fallback--md',
      inline: 'ui-identity-frame__fallback--inline',
    },
  },
  defaultVariants: {
    size: 'sm',
  },
})

/** Inset-row geometry — content-column gap and vertical alignment. */
export const identityInsetRowVariants = cva('flex min-w-0', {
  variants: {
    density: {
      compact: 'gap-2',
      comfortable: 'gap-3',
      spacious: 'gap-4',
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
