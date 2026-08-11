import type { ContentCardDensity } from '@rpg/ui'

/** Width of one leading utility column — shared with CollapsibleListItem geometry tokens. */
export const ENTITY_UTILITY_SIZE_VALUE = 'calc(var(--spacing)*6)'

/** Flex gap between adjacent leading utilities — grip and caret intentionally touch. */
export const ENTITY_UTILITY_GAP_VALUE = '0px'

export type EntityLeadingGeometryInput = {
  count: number
  density: ContentCardDensity
}

export type EntityLeadingGeometry = {
  utilitySize: string
  utilityGap: string
  contentGap: string
  contentOffset: string
}

export function resolveEntityLeadingContentGapValue(density: ContentCardDensity): string {
  return density === 'compact' ? 'calc(var(--spacing)*2)' : 'calc(var(--spacing)*3)'
}

/** Policy SSOT for leading rail width and published content-start offset. */
export function resolveEntityLeadingGeometry({
  count,
  density,
}: EntityLeadingGeometryInput): EntityLeadingGeometry {
  const utilitySize = ENTITY_UTILITY_SIZE_VALUE
  const utilityGap = ENTITY_UTILITY_GAP_VALUE
  const contentGap = count > 0 ? resolveEntityLeadingContentGapValue(density) : '0px'

  if (count <= 0) {
    return {
      utilitySize,
      utilityGap,
      contentGap: '0px',
      contentOffset: '0px',
    }
  }

  const interUtilityGapTerm = count > 1 ? `${Math.max(0, count - 1)} * ${utilityGap}` : '0px'
  const contentOffset =
    count === 1
      ? `calc(${utilitySize} + ${contentGap})`
      : `calc(${count} * ${utilitySize} + ${interUtilityGapTerm} + ${contentGap})`

  return {
    utilitySize,
    utilityGap,
    contentGap,
    contentOffset,
  }
}
