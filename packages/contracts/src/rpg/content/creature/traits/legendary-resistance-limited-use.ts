import type { RestLimitedUse } from '../../../primitives/limited-use'
import {
  resolveContextualCount,
  type ContextualCount,
  type ContextualCountResolutionContext,
} from '../../../primitives/contextual-count'

export function legendaryResistanceLimitedUse(
  config: { uses: ContextualCount },
  context: ContextualCountResolutionContext,
): RestLimitedUse {
  const value = resolveContextualCount(config.uses, context)
  return {
    kind: 'uses',
    count: { kind: 'fixed', value },
    recovery: { minimumRest: 'long' },
  }
}
