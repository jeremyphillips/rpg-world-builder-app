import { ATTACK_RANGE_FEET } from '@rpg/contracts'

export function isAttackRangeNormalValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

/** Preset feet values strictly greater than the current normal range. */
export function attackLongRangePresetFeet(normal: unknown): readonly number[] {
  if (!isAttackRangeNormalValue(normal)) return []
  return ATTACK_RANGE_FEET.filter((feet) => feet > normal)
}

export function attackLongRangeAddGate(normal: unknown): boolean {
  if (!isAttackRangeNormalValue(normal)) return false
  return attackLongRangePresetFeet(normal).length > 0
}
