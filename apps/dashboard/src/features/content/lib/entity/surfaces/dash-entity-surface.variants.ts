import { cn } from '@rpg/ui'

import type { EntitySurfaceEdges } from '../anatomy/entity-surface-edges.lib'

function leadingCountModifier(count: number): string {
  if (count <= 0) return 'dash-entity-surface--leading-0'
  if (count === 1) return 'dash-entity-surface--leading-1'
  return 'dash-entity-surface--leading-2'
}

/** Publishes entity surface inset tokens on card shells and embedded detail rows. */
export function entitySurfaceVariants({
  density,
  edges,
  leadingUtilityCount,
}: {
  density: 'compact' | 'comfortable' | 'spacious'
  edges: EntitySurfaceEdges
  leadingUtilityCount: number
}): string {
  return cn(
    'dash-entity-surface',
    density === 'compact'
      ? 'dash-entity-surface--compact'
      : density === 'spacious'
        ? 'dash-entity-surface--spacious'
        : 'dash-entity-surface--comfortable',
    edges.start === 'utility'
      ? 'dash-entity-surface--start-utility'
      : 'dash-entity-surface--start-default',
    edges.end === 'utility'
      ? 'dash-entity-surface--end-utility'
      : 'dash-entity-surface--end-default',
    leadingCountModifier(leadingUtilityCount),
  )
}
