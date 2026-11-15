import { RECHARGE_DIE_FACES } from '@rpg/contracts'

/** Matches `limitedUseSchema` recharge `minRoll`. */
const RECHARGE_MIN_ROLL = 2

export const MONSTER_RECHARGE_SEED = { kind: 'recharge' as const, minRoll: 5 }

type RechargeValue = { kind: 'recharge'; minRoll: number }

export function completeRecharge(value: unknown): RechargeValue | undefined {
  if (!value || typeof value !== 'object') return undefined
  const recharge = value as { kind?: unknown; minRoll?: unknown }
  if (recharge.kind !== 'recharge' || typeof recharge.minRoll !== 'number') return undefined
  if (!Number.isInteger(recharge.minRoll)) return undefined
  if (recharge.minRoll < RECHARGE_MIN_ROLL || recharge.minRoll > RECHARGE_DIE_FACES)
    return undefined
  return { kind: 'recharge', minRoll: recharge.minRoll }
}

/** Blank clears the recharge. Anything other than a d6 threshold leaves the stored value alone. */
export function rechargeValueFromRaw(raw: string): RechargeValue | undefined | 'unchanged' {
  if (raw.trim() === '') return undefined
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < RECHARGE_MIN_ROLL || parsed > RECHARGE_DIE_FACES) {
    return 'unchanged'
  }
  return { kind: 'recharge', minRoll: parsed }
}
