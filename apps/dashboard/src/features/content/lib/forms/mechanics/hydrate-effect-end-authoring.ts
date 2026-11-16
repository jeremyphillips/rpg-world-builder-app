import { effectEndSchema, resolveSelectIdFromEffectEnd } from '@rpg/contracts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function hydrateConditionEffectEndRow(
  row: Record<string, unknown>,
): Record<string, unknown> {
  if (row.kind !== 'condition') return row
  const parsed = effectEndSchema.safeParse(row.end)
  const option = parsed.success ? resolveSelectIdFromEffectEnd(parsed.data) : undefined
  if (!option) return row
  return { ...row, effectEndOption: option }
}

export function hydrateOnHitInAction<T extends Record<string, unknown>>(action: T): T {
  const onHit = action.onHit
  if (!isRecord(onHit) || !Array.isArray(onHit.effects)) return action
  return {
    ...action,
    onHit: {
      ...onHit,
      effects: onHit.effects.map((row) =>
        isRecord(row) ? hydrateConditionEffectEndRow(row) : row,
      ),
    },
  }
}

export function hydrateOnHitInActionList<T extends Record<string, unknown>>(
  actions: readonly T[],
): T[] {
  return actions.map((action) => (isRecord(action) ? hydrateOnHitInAction(action) : action))
}
