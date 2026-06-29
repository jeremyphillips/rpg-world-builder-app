import { describe, expect, it } from 'vitest'

import { applyWeaponModeValueSync } from './weapon-form-sync'

describe('applyWeaponModeValueSync', () => {
  it('returns undefined when mode is unset', () => {
    expect(applyWeaponModeValueSync({ properties: ['reach'] })).toBeUndefined()
  })

  it('returns undefined when mode change leaves values compatible', () => {
    expect(
      applyWeaponModeValueSync({
        mode: 'melee',
        properties: ['finesse', 'reach'],
        mastery: 'vex',
      }),
    ).toBeUndefined()
  })

  it('strips incompatible properties when switching to ranged', () => {
    expect(
      applyWeaponModeValueSync({
        mode: 'ranged',
        properties: ['reach', 'finesse', 'versatile'],
        versatileDamage: { count: 1, faces: 8 },
        mastery: 'vex',
      }),
    ).toEqual({
      properties: ['finesse'],
      versatileDamage: undefined,
    })
  })

  it('strips incompatible properties when switching to melee', () => {
    expect(
      applyWeaponModeValueSync({
        mode: 'melee',
        properties: ['ammunition', 'loading', 'thrown'],
      }),
    ).toEqual({
      properties: ['thrown'],
    })
  })

  it('clears cleave mastery when mode is ranged', () => {
    expect(
      applyWeaponModeValueSync({
        mode: 'ranged',
        properties: [],
        mastery: 'cleave',
      }),
    ).toEqual({
      mastery: undefined,
    })
  })
})
