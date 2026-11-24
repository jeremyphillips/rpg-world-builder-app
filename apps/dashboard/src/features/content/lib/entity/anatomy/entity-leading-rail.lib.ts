import { ENTITY_UTILITY_SIZE_VALUE } from './entity-leading-geometry.lib'

/** Shared with CollapsibleListItem leading chrome — keep values in sync. */
export const ENTITY_LEADING_SIZE_VAR = '--leading-chrome-size'

export const ENTITY_LEADING_SIZE_VALUE = ENTITY_UTILITY_SIZE_VALUE

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
