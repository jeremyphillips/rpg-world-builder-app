import { cva } from 'class-variance-authority'

import { identityFrameFallbackIconClasses } from './identity-frame-tokens.variants'
import type { IdentityFrameSize } from './identity-frame-tokens.variants'

export const contentDisplayFallbackIconVariants = cva('text-muted-foreground', {
  variants: {
    size: identityFrameFallbackIconClasses,
  },
  defaultVariants: {
    size: 'sm',
  },
})

export type ContentDisplayFallbackIconSize = IdentityFrameSize
