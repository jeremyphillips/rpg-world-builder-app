import { cn } from '@rpg/ui'

import {
  entitySurfaceHorizontalInsetClasses,
  entitySurfaceVerticalInsetVariants,
} from '../../entity-surface-inset.variants'

/** Header/content inset — horizontal and vertical rhythm from surface tokens. */
export function entityCardContentInsetVariants({
  density,
}: {
  density: 'compact' | 'comfortable'
}) {
  return cn(
    'w-full min-w-0',
    entitySurfaceHorizontalInsetClasses,
    entitySurfaceVerticalInsetVariants({ density }),
  )
}
