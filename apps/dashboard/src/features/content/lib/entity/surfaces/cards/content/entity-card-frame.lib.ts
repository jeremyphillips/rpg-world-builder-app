import { cn } from '@rpg/ui'

import type { EntitySurfaceEdges } from '../../../anatomy/entity-surface-edges.lib'
import { entitySurfaceVariants } from '../../dash-entity-surface.variants'

/** Perimeter shell — tone/state chrome comes from `cardSurfaceVariants` on the frame host. */
export function entityCardFrameClassName({
  density,
  edges,
  leadingUtilityCount = 0,
}: {
  density: 'compact' | 'comfortable' | 'spacious'
  edges: EntitySurfaceEdges
  leadingUtilityCount?: number
}): string {
  return cn('dash-entity-card', entitySurfaceVariants({ density, edges, leadingUtilityCount }))
}
