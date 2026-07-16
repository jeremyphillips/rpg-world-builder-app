import { describe, expect, it } from 'vitest'

import {
  formatSignedModifier,
  formatWeaponDamageWithModifier,
  resolveWeaponAttackAbility,
  resolveWeaponAttackAbilityModifier,
  weaponAttackBonus,
} from './weapon-attack'

describe('resolveWeaponAttackAbilityModifier', () => {
  it('uses DEX for ranged weapons', () => {
    expect(
      resolveWeaponAttackAbilityModifier(
        { mode: 'ranged', properties: ['ammunition'] },
        { dex: 16 },
      ),
    ).toBe(3)
  })

  it('uses STR for melee weapons without finesse', () => {
    expect(
      resolveWeaponAttackAbilityModifier({ mode: 'melee', properties: ['versatile'] }, { str: 16 }),
    ).toBe(3)
  })

  it('uses the higher of STR and DEX for finesse melee weapons', () => {
    expect(
      resolveWeaponAttackAbilityModifier(
        { mode: 'melee', properties: ['finesse'] },
        { str: 10, dex: 16 },
      ),
    ).toBe(3)
  })
})

describe('weaponAttackBonus', () => {
  it('adds proficiency bonus only when proficient', () => {
    expect(weaponAttackBonus(3, true, 2)).toBe(5)
    expect(weaponAttackBonus(3, false, 2)).toBe(3)
  })
})

describe('formatWeaponDamageWithModifier', () => {
  it('formats dice damage with a signed modifier', () => {
    expect(formatWeaponDamageWithModifier({ dice: { count: 1, faces: 8 } }, 3)).toBe('1d8 +3')
  })
})

describe('resolveWeaponAttackAbility', () => {
  it('returns dex for ranged and str for melee defaults', () => {
    expect(resolveWeaponAttackAbility({ mode: 'ranged', properties: [] })).toBe('dex')
    expect(resolveWeaponAttackAbility({ mode: 'melee', properties: [] })).toBe('str')
  })
})

describe('formatSignedModifier', () => {
  it('prefixes non-negative values with a plus sign', () => {
    expect(formatSignedModifier(3)).toBe('+3')
    expect(formatSignedModifier(-1)).toBe('-1')
  })
})
