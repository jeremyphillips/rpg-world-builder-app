import type { ContextualCount } from './schema'

export type ContextualCountResolutionContext = {
  inLair?: boolean
  lairEnabled?: boolean
}

/** Picks the effective total for the current encounter context. */
export function resolveContextualCount(
  count: ContextualCount,
  context: ContextualCountResolutionContext,
): number {
  if (context.lairEnabled === true && context.inLair === true && count.inLair !== undefined) {
    return count.inLair
  }
  return count.normal
}
