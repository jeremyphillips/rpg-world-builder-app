import type { CSSProperties } from 'react'
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

/** Canonical distance from leading edge to entity content column — published by surfaces with aligned siblings. */
export const ENTITY_CONTENT_OFFSET_VAR = '--entity-content-offset'

import { ENTITY_SURFACE_INLINE_START_VAR } from './entity-surface-inset.variants'

/** DEC body inline-start — surface start inset + content offset; static Tailwind utility only. */
export const ENTITY_BODY_INLINE_START_VAR = '--entity-body-inline-start'

export const ENTITY_BODY_INLINE_START_VALUE = `calc(var(${ENTITY_SURFACE_INLINE_START_VAR}) + var(${ENTITY_CONTENT_OFFSET_VAR}))`

/** @deprecated Alias during migration — prefer {@link ENTITY_CONTENT_OFFSET_VAR}. */
export const ENTITY_LEADING_OFFSET_VAR = '--entity-leading-offset'

/** @deprecated Alias during migration — prefer {@link ENTITY_CONTENT_OFFSET_VAR}. */
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

/** @deprecated Prefer {@link buildEntityContentOffsetStyle}. */
export function buildEntityLeadingOffsetValue(utilityCount: number): string {
  return resolveEntityLeadingGeometry({ count: utilityCount, density: 'compact' }).contentOffset
}

/** Publishes utility size for anatomy-only surfaces (CEC) — no aligned sibling region. */
export function buildEntityLeadingChromeSizeStyle(): CSSProperties {
  return {
    [ENTITY_LEADING_SIZE_VAR]: ENTITY_LEADING_SIZE_VALUE,
  } as CSSProperties
}

/** Publishes canonical content offset and migration aliases on disclosure surfaces. */
export function buildEntityContentOffsetStyle({
  count,
  density,
}: {
  count: number
  density: ContentCardDensity
}): CSSProperties {
  const geometry = resolveEntityLeadingGeometry({ count, density })

  return {
    [ENTITY_LEADING_SIZE_VAR]: geometry.utilitySize,
    [ENTITY_CONTENT_OFFSET_VAR]: geometry.contentOffset,
    [ENTITY_BODY_INLINE_START_VAR]: ENTITY_BODY_INLINE_START_VALUE,
    [ENTITY_LEADING_OFFSET_VAR]: `var(${ENTITY_CONTENT_OFFSET_VAR})`,
    [ENTITY_CONTENT_INDENT_VAR]: `var(${ENTITY_CONTENT_OFFSET_VAR})`,
  } as CSSProperties
}

/** @deprecated Prefer {@link buildEntityContentOffsetStyle}. */
export function buildEntityLeadingOffsetStyle(
  utilityCount: number,
  density: ContentCardDensity = 'compact',
): CSSProperties {
  return buildEntityContentOffsetStyle({ count: utilityCount, density })
}
