import type { LimitedUseDraft } from '@rpg/contracts'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Keeps the active limited-use keys, including partial leaves.
 * Inactive keys are absent because the caller replaces the object when the kind changes.
 * An explicit no-limit choice omits the field before this runs.
 */
function normalizeRecharge(value: Record<string, unknown>): LimitedUseDraft {
  const next: LimitedUseDraft = { kind: 'recharge' }
  if (typeof value.minRoll === 'number') next.minRoll = value.minRoll
  return next
}

function normalizeUseCount(count: unknown): LimitedUseDraft['count'] {
  if (!isRecord(count)) return undefined
  if (count.kind === 'proficiency-bonus') return { kind: 'proficiency-bonus' }
  if (count.kind !== 'fixed') return undefined
  return typeof count.value === 'number' ? { kind: 'fixed', value: count.value } : { kind: 'fixed' }
}

function normalizeUses(value: Record<string, unknown>): LimitedUseDraft {
  const next: LimitedUseDraft = { kind: 'uses', count: normalizeUseCount(value.count) }
  const recovery = value.recovery
  if (!isRecord(recovery)) return next
  if (recovery.minimumRest === 'short' || recovery.minimumRest === 'long') {
    next.recovery = { minimumRest: recovery.minimumRest }
  }
  return next
}

export function normalizeLimitedUse(value: unknown): LimitedUseDraft | undefined {
  if (!isRecord(value)) return undefined
  if (value.kind === 'recharge') return normalizeRecharge(value)
  if (value.kind === 'uses') return normalizeUses(value)
  return undefined
}
