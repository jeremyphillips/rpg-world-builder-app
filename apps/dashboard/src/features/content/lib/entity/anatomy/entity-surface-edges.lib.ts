import { isEntityAnatomyUtilityTrailing } from './entity-anatomy-trailing.lib'
import type { EntityAnatomyTrailing } from './entity-anatomy-trailing.types'

export type EntitySurfaceEdge = 'default' | 'utility'

export type EntitySurfaceEdges = {
  start: EntitySurfaceEdge
  end: EntitySurfaceEdge
}

export const ENTITY_SURFACE_DEFAULT_EDGES: EntitySurfaceEdges = { start: 'default', end: 'default' }

/**
 * Edge inset policy shared by CEC, DEC, CatalogEntityRow, and DetailEntityRow.
 * Triggered by kind, not presence: bordered `action` / `group` trailing keeps the default end.
 */
export function resolveEntitySurfaceEdges({
  leadingUtilityCount,
  trailing,
}: {
  leadingUtilityCount: number
  trailing?: EntityAnatomyTrailing
}): EntitySurfaceEdges {
  return {
    start: leadingUtilityCount > 0 ? 'utility' : 'default',
    end: isEntityAnatomyUtilityTrailing(trailing) ? 'utility' : 'default',
  }
}
