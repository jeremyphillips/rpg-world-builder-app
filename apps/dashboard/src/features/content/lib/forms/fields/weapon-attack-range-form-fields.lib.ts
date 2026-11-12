import { ATTACK_RANGE_FEET } from '@rpg/contracts'

export const CHOOSE_NORMAL_RANGE_FIRST_LABEL = 'Choose a normal range first.'

export function isAttackRangeNormalValue(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
}

/** Preset feet values strictly greater than the current normal range. */
export function attackLongRangePresetFeet(normal: unknown): readonly number[] {
  if (!isAttackRangeNormalValue(normal)) return []
  return ATTACK_RANGE_FEET.filter((feet) => feet > normal)
}

export function attackLongRangeAddGate(normal: unknown): { disabled: boolean; reason?: string } {
  if (!isAttackRangeNormalValue(normal)) {
    return { disabled: true, reason: CHOOSE_NORMAL_RANGE_FIRST_LABEL }
  }
  if (attackLongRangePresetFeet(normal).length === 0) {
    return { disabled: true }
  }
  return { disabled: false }
}
