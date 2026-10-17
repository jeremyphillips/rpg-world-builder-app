import { cn } from '@rpg/ui'

import {
  ENTITY_SURFACE_DEFAULT_EDGES,
  type EntitySurfaceEdges,
} from '../../../anatomy/entity-surface-edges.lib'
import { entitySurfaceInsetVariants } from '../../entity-surface-inset.variants'

/** Perimeter modifiers — tone/state chrome comes from `cardSurfaceVariants` on the frame host. */
export function entityCardFrameVariants({
  density,
  edges = ENTITY_SURFACE_DEFAULT_EDGES,
}: {
  density: 'compact' | 'comfortable'
  edges?: EntitySurfaceEdges
}) {
  return cn(
    'dash-entity-card',
    density === 'compact' ? 'dash-entity-card--compact' : 'dash-entity-card--comfortable',
    edges.start === 'utility' && 'dash-entity-card--start-utility',
    edges.end === 'utility' && 'dash-entity-card--end-utility',
    entitySurfaceInsetVariants({ density, start: edges.start, end: edges.end }),
  )
}
