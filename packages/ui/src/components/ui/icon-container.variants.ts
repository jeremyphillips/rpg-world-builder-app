import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { iconGlyphDirectChildClasses } from './icon-glyph.variants'
import { establishSurfaceCurrent } from './surface-current.lib'

export const ICON_CONTAINER_SIZES = ['sm', 'md'] as const
export type IconContainerSize = (typeof ICON_CONTAINER_SIZES)[number]

export const iconContainerVariants = cva(
  cn(
    'flex shrink-0 items-center justify-center bg-surface-strong text-muted-foreground',
    establishSurfaceCurrent('surface-strong'),
  ),
  {
    variants: {
      shape: {
        box: 'rounded-md',
        circle: 'rounded-full',
      },
      size: {
        sm: cn('size-10', iconGlyphDirectChildClasses.lg),
        md: cn('size-[3.75rem]', '[&>svg]:size-6'),
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
