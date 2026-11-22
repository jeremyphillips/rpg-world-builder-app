import type { MonsterAction } from '../../content/monster/action/index'
import { limitedUseSchema } from '../../primitives/limited-use'

const IF_AVAILABLE_SUFFIX = ' if available'

function hasConfiguredLimitedUse(value: unknown): boolean {
  return limitedUseSchema.safeParse(value).success
}

/** Whether a referenced row carries a published usage restriction relevant to Multiattack prose. */
export function multiattackReferenceHasUsageRestriction(
  action: MonsterAction | undefined,
  spellId?: string,
): boolean {
  if (!action) return false
  if ('onceUntilNextTurn' in action && action.onceUntilNextTurn === true) return true

  if (action.kind === 'spell' && spellId) {
    const entry = action.spells?.find((row) => row.spellId === spellId)
    if (entry && hasConfiguredLimitedUse(entry.limitedUse)) return true
  }

  const topLevel =
    'limitedUse' in action ? (action as { limitedUse?: unknown }).limitedUse : undefined
  return hasConfiguredLimitedUse(topLevel)
}

export function multiattackIfAvailableSuffix(
  referenced: readonly { actionId: string; spellId?: string }[],
  resolveAction: (actionId: string) => MonsterAction | undefined,
  options?: { skip?: boolean },
): string {
  if (options?.skip) return ''
  const limited = referenced.some((ref) =>
    multiattackReferenceHasUsageRestriction(resolveAction(ref.actionId), ref.spellId),
  )
  return limited ? IF_AVAILABLE_SUFFIX : ''
}
