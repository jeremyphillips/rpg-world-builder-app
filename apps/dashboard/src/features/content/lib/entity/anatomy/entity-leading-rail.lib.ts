import type { ContentCardDensity } from '@rpg/ui'

import {
  ENTITY_UTILITY_SIZE_VALUE,
  resolveEntityLeadingGeometry,
} from './entity-leading-geometry.lib'

/** Shared with CollapsibleListItem leading chrome — keep values in sync. */
export const ENTITY_LEADING_SIZE_VAR = '--leading-chrome-size'

/** @deprecated Split into utilityGap/contentGap layout — do not use for entity offset math. */
export const ENTITY_LEADING_GAP_VAR = '--leading-chrome-gap'

export const ENTITY_LEADING_SIZE_VALUE = ENTITY_UTILITY_SIZE_VALUE

/** @deprecated Retained for non-entity ArrayItem hosts during migration. */
export const ENTITY_LEADING_GAP_VALUE = 'calc(var(--spacing)*1)'

export {
  ENTITY_BODY_INLINE_END_VAR,
  ENTITY_BODY_INLINE_START_VAR,
  ENTITY_CONTENT_OFFSET_VAR,
} from './entity-geometry.tokens'

export type EntityLeadingUtilityOptions = {
  dragHandle?: boolean
  disclosure?: boolean
  /** Single optional utility on static EntityCard / embedded EntityAnatomyHost (0–1). */
  leading?: boolean
}

export function resolveEntityLeadingUtilityCount(options: EntityLeadingUtilityOptions): number {
  if (options.leading !== undefined) {
    return options.leading ? 1 : 0
  }

  return (options.dragHandle ? 1 : 0) + (options.disclosure ? 1 : 0)
}

/** @deprecated Geometry is published via `dash-entity-surface--leading-*` modifiers. */
export function buildEntityLeadingOffsetValue(utilityCount: number): string {
  return resolveEntityLeadingGeometry({ count: utilityCount, density: 'compact' }).contentOffset
}

/** @deprecated Geometry is published via `dash-entity-surface` on EntityCardFrame. */
export function buildEntityLeadingOffsetStyle(
  _utilityCount: number,
  _density: ContentCardDensity = 'compact',
): Record<string, never> {
  return {}
}
