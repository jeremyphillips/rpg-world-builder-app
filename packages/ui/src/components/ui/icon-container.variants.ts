import { cva } from 'class-variance-authority'

import { cn } from '../../lib/utils'
import { establishSurfaceCurrent } from './surface-current.lib'
import {
  identityFrameShapeClasses,
  identityFrameSizeClasses,
} from './identity-frame-tokens.variants'

export const ICON_CONTAINER_SIZES = ['xs', 'sm', 'md', 'inline'] as const
export type IconContainerSize = (typeof ICON_CONTAINER_SIZES)[number]

export const iconContainerVariants = cva(
  cn(
    'ui-icon-container flex shrink-0 items-center justify-center bg-surface-strong text-muted-foreground',
    establishSurfaceCurrent('surface-strong'),
  ),
  {
    variants: {
      shape: identityFrameShapeClasses,
      size: {
        xs: cn(identityFrameSizeClasses.xs, 'ui-icon-container--xs'),
        sm: cn(identityFrameSizeClasses.sm, 'ui-icon-container--sm'),
        md: cn(identityFrameSizeClasses.md, 'ui-icon-container--md'),
        inline: cn(identityFrameSizeClasses.inline, 'ui-icon-container--inline'),
      },
    },
    defaultVariants: {
      shape: 'box',
      size: 'sm',
    },
  },
)
