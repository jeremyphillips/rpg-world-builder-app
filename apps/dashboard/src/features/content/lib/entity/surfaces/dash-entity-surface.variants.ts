import { cn } from '@rpg/ui'

import type { EntitySurfaceEdges } from '../anatomy/entity-surface-edges.lib'

export const DASH_ENTITY_SURFACE_BLOCK = 'dash-entity-surface' as const

export const DASH_ENTITY_CARD_BODY_CLASS = 'dash-entity-card__body' as const

export const DASH_ENTITY_SURFACE_INSET_HORIZONTAL_CLASS =
  'dash-entity-surface__inset-horizontal' as const

export const DASH_ENTITY_SURFACE_DISCLOSURE_CONTENT_CLASS =
  'dash-entity-surface__disclosure-content' as const

export const DASH_ENTITY_SURFACE_DISCLOSURE_PREVIEW_OFFSET_CLASS =
  'dash-entity-surface__disclosure-preview-offset' as const

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
  density: 'compact' | 'comfortable'
  edges: EntitySurfaceEdges
  leadingUtilityCount: number
}): string {
  return cn(
    DASH_ENTITY_SURFACE_BLOCK,
    density === 'compact' ? 'dash-entity-surface--compact' : 'dash-entity-surface--comfortable',
    edges.start === 'utility'
      ? 'dash-entity-surface--start-utility'
      : 'dash-entity-surface--start-default',
    edges.end === 'utility'
      ? 'dash-entity-surface--end-utility'
      : 'dash-entity-surface--end-default',
    leadingCountModifier(leadingUtilityCount),
  )
}
