import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { iconGlyphDirectChildClasses } from './icon-glyph.variants'
import { establishSurfaceCurrent } from './surface-current.lib'
import {
  identityFrameFallbackIconClasses,
  identityFrameShapeClasses,
  identityFrameSizeClasses,
} from './identity-frame-tokens.variants'

export const ICON_CONTAINER_SIZES = ['xs', 'sm', 'md', 'inline'] as const
export type IconContainerSize = (typeof ICON_CONTAINER_SIZES)[number]

export const iconContainerVariants = cva(
  cn(
    'flex shrink-0 items-center justify-center bg-surface-strong text-muted-foreground',
    establishSurfaceCurrent('surface-strong'),
  ),
  {
    variants: {
      shape: identityFrameShapeClasses,
      size: {
        xs: cn(identityFrameSizeClasses.xs, identityFrameFallbackIconClasses.xs),
        sm: cn(identityFrameSizeClasses.sm, identityFrameFallbackIconClasses.sm),
        md: cn(identityFrameSizeClasses.md, identityFrameFallbackIconClasses.md),
        inline: cn(identityFrameSizeClasses.inline, identityFrameFallbackIconClasses.inline),
      },
    },
    defaultVariants: {
      shape: 'box',
      size: 'sm',
    },
  },
)

/** @deprecated Icon glyphs are sized on the container via direct-child selectors. */
export const iconContainerGlyphClasses = iconGlyphDirectChildClasses.lg
