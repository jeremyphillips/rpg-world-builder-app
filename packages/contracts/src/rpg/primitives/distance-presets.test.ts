import { describe, expect, it } from 'vitest'

import {
  ATTACK_RANGE_FEET,
  MEASURED_RANGE_FEET,
  PUBLISHED_WEAPON_RANGE_FEET,
  SPELL_RANGE_FEET,
  SPELL_RANGE_MILES,
  standardFeet,
} from './distance-presets'

describe('standardFeet', () => {
  it('builds an inclusive ladder', () => {
    expect(standardFeet(5, 30, 5)).toEqual([5, 10, 15, 20, 25, 30])
    expect(standardFeet(10, 120, 10)).toEqual([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120])
  })
})

describe('distance presets', () => {
  it('keeps measured range on the 5-foot ladder through 150', () => {
    expect(MEASURED_RANGE_FEET).toEqual(standardFeet(5, 150, 5))
    expect(MEASURED_RANGE_FEET).not.toContain(240)
    expect(MEASURED_RANGE_FEET).not.toContain(300)
  })

  it('includes monster 240 in attack options and not in published weapon bands', () => {
    expect(ATTACK_RANGE_FEET).toContain(240)
    expect(PUBLISHED_WEAPON_RANGE_FEET).not.toContain(240)
    for (const feet of PUBLISHED_WEAPON_RANGE_FEET) {
      expect(ATTACK_RANGE_FEET).toContain(feet)
    }
  })

  it('lists audited spell distances without using them as a schema', () => {
    expect(SPELL_RANGE_FEET).toEqual([10, 15, 30, 60, 90, 120, 150, 300, 500])
    expect(SPELL_RANGE_MILES).toEqual([1, 500])
  })
})
