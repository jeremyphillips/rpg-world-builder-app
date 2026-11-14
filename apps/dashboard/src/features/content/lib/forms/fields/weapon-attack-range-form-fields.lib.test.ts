import { ATTACK_RANGE_FEET } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import {
  attackLongRangeAddGate,
  attackLongRangePresetFeet,
} from './weapon-attack-range-form-fields.lib'

describe('attack long range helpers', () => {
  it('returns no long presets when normal is empty or invalid', () => {
    expect(attackLongRangePresetFeet(undefined)).toEqual([])
    expect(attackLongRangePresetFeet('')).toEqual([])
    expect(attackLongRangePresetFeet(0)).toEqual([])
  })

  it('filters long presets to values strictly greater than normal', () => {
    expect(attackLongRangePresetFeet(60)).toEqual(ATTACK_RANGE_FEET.filter((feet) => feet > 60))
    expect(attackLongRangePresetFeet(60)).toContain(80)
    expect(attackLongRangePresetFeet(60)).not.toContain(60)
  })

  it('gates add long range on a valid normal and available presets', () => {
    expect(attackLongRangeAddGate(undefined)).toBe(false)
    const maxNormal = ATTACK_RANGE_FEET.at(-1)!
    expect(attackLongRangeAddGate(maxNormal)).toBe(false)
    expect(attackLongRangeAddGate(60)).toBe(true)
  })
})
