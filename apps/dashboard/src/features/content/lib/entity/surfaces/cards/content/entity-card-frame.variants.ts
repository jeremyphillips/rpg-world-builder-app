import { cva } from 'class-variance-authority'

import { cn } from '@rpg/ui'

import {
  entitySurfaceHorizontalInsetClasses,
  entitySurfaceInsetVariants,
  entitySurfaceVerticalInsetVariants,
} from '../../entity-surface-inset.variants'

const entityCardFrameShellVariants = cva('w-full min-w-0 rounded-md border border-border bg-card', {
  variants: {
    disabled: {
      true: 'opacity-60',
      false: '',
    },
  },
  defaultVariants: {
    disabled: false,
  },
})

/** Canonical bordered entity card shell — shared by ContentEntityCard. */
export function entityCardFrameVariants({
  density,
  disabled = false,
  leading = false,
}: {
  density: 'compact' | 'comfortable'
  disabled?: boolean
  leading?: boolean
}) {
  return cn(
    entityCardFrameShellVariants({ disabled }),
    entitySurfaceInsetVariants({ density, leading }),
    entitySurfaceHorizontalInsetClasses,
    entitySurfaceVerticalInsetVariants({ density }),
  )
}
