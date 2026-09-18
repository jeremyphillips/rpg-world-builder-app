import { cva } from 'class-variance-authority'

import { cn, establishSurfaceCurrent } from '@rpg/ui'

import { entitySurfaceInsetVariants } from '../../entity-surface-inset.variants'

export type EntityCardSurface = 'card' | 'subtle' | 'catalogRow'

const entityCardFrameShellVariants = cva(
  'w-full min-w-0 overflow-hidden rounded-md border border-border',
  {
    variants: {
      surface: {
        card: 'bg-card',
        subtle: cn('bg-surface-subtle', establishSurfaceCurrent('surface-subtle')),
        catalogRow: 'bg-catalog-picker-row-surface',
      },
      disabled: {
        true: 'opacity-60',
        false: '',
      },
    },
    defaultVariants: {
      surface: 'card',
      disabled: false,
    },
  },
)

/** Perimeter chrome only — publishes inset CSS vars; padding lives on EntityCardContent. */
export function entityCardFrameVariants({
  density,
  surface = 'card',
  disabled = false,
  leading = false,
}: {
  density: 'compact' | 'comfortable'
  surface?: EntityCardSurface
  disabled?: boolean
  leading?: boolean
}) {
  return cn(
    entityCardFrameShellVariants({ surface, disabled }),
    entitySurfaceInsetVariants({ density, leading }),
  )
}
