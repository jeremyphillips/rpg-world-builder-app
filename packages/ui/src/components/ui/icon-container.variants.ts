import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { iconGlyphDirectChildClasses } from './icon-glyph.variants'
import { establishSurfaceCurrent } from './surface-current.lib'

export const iconContainerVariants = cva(
  cn(
    'flex size-10 shrink-0 items-center justify-center bg-surface-strong text-muted-foreground',
    establishSurfaceCurrent('surface-strong'),
    iconGlyphDirectChildClasses.lg,
  ),
  {
    variants: {
      shape: {
        box: 'rounded-md',
        circle: 'rounded-full',
      },
    },
    defaultVariants: {
      shape: 'box',
    },
  },
)

/** @deprecated Icon glyphs are sized on the container via direct-child selectors. */
export const iconContainerGlyphClasses = iconGlyphDirectChildClasses.lg
