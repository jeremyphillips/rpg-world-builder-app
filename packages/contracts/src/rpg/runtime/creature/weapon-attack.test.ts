import { describe, expect, it } from 'vitest'

import {
  resolveWeaponAttackAbilityModifier,
  resolveWeaponAttackModes,
  resolveWeaponAttackReach,
} from './weapon-attack'

describe('resolveWeaponAttackAbilityModifier', () => {
  it('uses Strength for a melee weapon without finesse', () => {
    expect(
      resolveWeaponAttackAbilityModifier({ mode: 'melee', properties: [] }, { str: 16, dex: 10 }),
    ).toBe(3)
  })

  it('uses Dexterity for a ranged weapon without finesse', () => {
    expect(
      resolveWeaponAttackAbilityModifier(
        { mode: 'ranged', properties: ['ammunition'] },
        { str: 16, dex: 12 },
      ),
    ).toBe(1)
  })

  it('uses the higher score for a ranged finesse weapon', () => {
    expect(
      resolveWeaponAttackAbilityModifier(
        { mode: 'ranged', properties: ['finesse', 'thrown'] },
        { str: 16, dex: 10 },
      ),
    ).toBe(3)
  })

  it('uses the same finesse modifier for a thrown melee weapon', () => {
    const weapon = { mode: 'melee' as const, properties: ['finesse', 'light', 'thrown'] as const }
    const scores = { str: 18, dex: 12 }
    expect(resolveWeaponAttackAbilityModifier(weapon, scores)).toBe(4)
    expect(resolveWeaponAttackModes(weapon)).toEqual(['melee', 'ranged'])
  })
})

describe('resolveWeaponAttackModes', () => {
  it('keeps a ranged thrown weapon ranged', () => {
    expect(resolveWeaponAttackModes({ mode: 'ranged', properties: ['finesse', 'thrown'] })).toEqual(
      ['ranged'],
    )
  })

  it('keeps an ordinary melee or ranged weapon on its type', () => {
    expect(resolveWeaponAttackModes({ mode: 'melee', properties: ['finesse'] })).toEqual(['melee'])
    expect(resolveWeaponAttackModes({ mode: 'ranged', properties: ['ammunition'] })).toEqual([
      'ranged',
    ])
  })

  it('adds ranged to a thrown melee weapon', () => {
    expect(resolveWeaponAttackModes({ mode: 'melee', properties: ['thrown'] })).toEqual([
      'melee',
      'ranged',
    ])
  })
})

describe('resolveWeaponAttackReach', () => {
  it('uses 5 feet for melee and 10 when the weapon has Reach', () => {
    expect(resolveWeaponAttackReach({ mode: 'melee', properties: [] })).toBe(5)
    expect(resolveWeaponAttackReach({ mode: 'melee', properties: ['reach', 'two-handed'] })).toBe(
      10,
    )
    expect(resolveWeaponAttackReach({ mode: 'ranged', properties: [] })).toBeUndefined()
  })
})
