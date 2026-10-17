import { cn } from '@rpg/ui'

import {
  ENTITY_SURFACE_DEFAULT_EDGES,
  type EntitySurfaceEdges,
} from '../../../anatomy/entity-surface-edges.lib'
import { entitySurfaceVariants } from '../../dash-entity-surface.variants'

/** Perimeter modifiers — tone/state chrome comes from `cardSurfaceVariants` on the frame host. */
export function entityCardFrameVariants({
  density,
  edges = ENTITY_SURFACE_DEFAULT_EDGES,
  leadingUtilityCount = 0,
}: {
  density: 'compact' | 'comfortable'
  edges?: EntitySurfaceEdges
  leadingUtilityCount?: number
}) {
  return cn(
    'dash-entity-card',
    density === 'compact' ? 'dash-entity-card--compact' : 'dash-entity-card--comfortable',
    entitySurfaceVariants({ density, edges, leadingUtilityCount }),
  )
}
