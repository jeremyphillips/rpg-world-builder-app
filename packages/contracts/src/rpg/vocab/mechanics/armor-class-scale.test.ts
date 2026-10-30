import { describe, expect, it } from 'vitest'

import {
  ARMOR_CLASS_RULES_MATRIX,
  armorBaseAcDisplayBounds,
  armorClassBoundsForProtection,
  armorClassDelta,
  armorClassFromProtection,
  compareArmorClass,
  fixedAcDisplayBounds,
  protectionFromArmorClass,
  type ArmorClassRules,
} from './armor-class-scale'

describe('armor class scale', () => {
  it('round-trips protection and effective AC for every ruleset', () => {
    for (const rules of ARMOR_CLASS_RULES_MATRIX) {
      for (const protection of [-10, 0, 1, 8, 15]) {
        const armorClass = armorClassFromProtection(rules, protection)
        expect(protectionFromArmorClass(rules, armorClass)).toBe(protection)
      }
    }
  })

  it('signs a protection delta with the ruleset direction', () => {
    const ascending = { mode: 'ascending', base: 10 } satisfies ArmorClassRules
    const descending = { mode: 'descending', base: 9 } satisfies ArmorClassRules
    expect(armorClassDelta(ascending, 2)).toBe(2)
    expect(armorClassDelta(ascending, -1)).toBe(-1)
    expect(armorClassDelta(descending, 2)).toBe(-2)
    expect(armorClassDelta(descending, 0)).toBe(0)
  })

  it('swaps closed bounds in descending and passes open ends through', () => {
    const ascending = { mode: 'ascending', base: 10 } satisfies ArmorClassRules
    const descending = { mode: 'descending', base: 10 } satisfies ArmorClassRules
    expect(armorClassBoundsForProtection(ascending, { min: 0, max: 15 })).toEqual({
      min: 10,
      max: 25,
    })
    expect(armorClassBoundsForProtection(descending, { min: 0, max: 15 })).toEqual({
      min: -5,
      max: 10,
    })
    expect(armorClassBoundsForProtection(ascending, { min: -10 })).toEqual({ min: 0 })
    expect(armorClassBoundsForProtection(descending, { min: -10 })).toEqual({ max: 20 })
    expect(armorBaseAcDisplayBounds({ mode: 'ascending', base: 9 })).toEqual({ min: 9, max: 24 })
    expect(fixedAcDisplayBounds({ mode: 'descending', base: 9 })).toEqual({ max: 19 })
  })

  it('compares through protection so better armor is positive in both directions', () => {
    for (const rules of ARMOR_CLASS_RULES_MATRIX) {
      const better = armorClassFromProtection(rules, 8)
      const worse = armorClassFromProtection(rules, 1)
      expect(compareArmorClass(rules, better, worse)).toBeGreaterThan(0)
      expect(compareArmorClass(rules, worse, better)).toBeLessThan(0)
      expect(compareArmorClass(rules, better, better)).toBe(0)
    }
  })
})
