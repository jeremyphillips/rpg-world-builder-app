import type { CSSProperties } from 'react'

/** Shared with CollapsibleListItem leading chrome — keep values in sync. */
export const ENTITY_LEADING_SIZE_VAR = '--leading-chrome-size'
export const ENTITY_LEADING_GAP_VAR = '--leading-chrome-gap'
export const ENTITY_LEADING_SIZE_VALUE = 'calc(var(--spacing)*6)'
export const ENTITY_LEADING_GAP_VALUE = 'calc(var(--spacing)*1)'

/** Content-start offset from occupied leading utilities — published by surface roots only. */
export const ENTITY_LEADING_OFFSET_VAR = '--entity-leading-offset'

/** @deprecated Alias during migration — prefer {@link ENTITY_LEADING_OFFSET_VAR}. */
export const ENTITY_CONTENT_INDENT_VAR = '--entity-content-indent'

export type EntityLeadingUtilityOptions = {
  dragHandle?: boolean
  disclosure?: boolean
  /** Single optional utility on CEC / embedded EntityItem (0–1). */
  leading?: boolean
}

export function resolveEntityLeadingUtilityCount(options: EntityLeadingUtilityOptions): number {
  if (options.leading !== undefined) {
    return options.leading ? 1 : 0
  }

  return (options.dragHandle ? 1 : 0) + (options.disclosure ? 1 : 0)
}

export function buildEntityLeadingOffsetValue(utilityCount: number): string {
  return `calc(${utilityCount} * var(${ENTITY_LEADING_SIZE_VAR}) + min(1, ${utilityCount}) * var(${ENTITY_LEADING_GAP_VAR}))`
}

/** Publishes leading geometry tokens and content-start offset on a surface root. */
export function buildEntityLeadingOffsetStyle(utilityCount: number): CSSProperties {
  return {
    [ENTITY_LEADING_SIZE_VAR]: ENTITY_LEADING_SIZE_VALUE,
    [ENTITY_LEADING_GAP_VAR]: ENTITY_LEADING_GAP_VALUE,
    [ENTITY_LEADING_OFFSET_VAR]: buildEntityLeadingOffsetValue(utilityCount),
    [ENTITY_CONTENT_INDENT_VAR]: `var(${ENTITY_LEADING_OFFSET_VAR})`,
  } as CSSProperties
}
