import type { ArrayErrorFocusContext, ArrayPatternConfig } from '@rpg/ui/form'

/** Default min/max keys for level-range tier arrays. */
export const LEVEL_RANGE_ARRAY_LEVEL_KEYS = {
  min: 'minLevel',
  max: 'maxLevel',
} as const

function resolveLevelKeys(ctx: ArrayErrorFocusContext): { min: string; max: string } {
  return {
    min: ctx.levelKeys?.min ?? LEVEL_RANGE_ARRAY_LEVEL_KEYS.min,
    max: ctx.levelKeys?.max ?? LEVEL_RANGE_ARRAY_LEVEL_KEYS.max,
  }
}

/** Maps table-level level-range validation issues to a focusable field within the row. */
export function resolveLevelRangeErrorFocusTarget(ctx: ArrayErrorFocusContext): string | undefined {
  const { min, max } = resolveLevelKeys(ctx)
  const relative = ctx.issue.relativePath ?? ''
  const leaf = relative.split('.').pop() ?? relative
  const message = ctx.issue.message.toLowerCase()

  if (leaf === max || message.includes('cover levels') || message.includes('end at')) {
    return max
  }

  if (
    leaf === min ||
    message.includes('overlap') ||
    message.includes('contiguous') ||
    message.includes('missing') ||
    message.includes('start at')
  ) {
    return min
  }

  return undefined
}

/** Shared array pattern for level-range tier editors. */
export function levelRangeArrayPattern(
  levelKeys: { min: string; max: string } = LEVEL_RANGE_ARRAY_LEVEL_KEYS,
): ArrayPatternConfig & { kind: 'levelRange'; levelKeys: { min: string; max: string } } {
  return {
    kind: 'levelRange',
    levelKeys,
    getErrorFocusTarget: resolveLevelRangeErrorFocusTarget,
  }
}
