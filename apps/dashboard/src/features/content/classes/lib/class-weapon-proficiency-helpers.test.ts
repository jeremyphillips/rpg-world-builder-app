import { describe, expect, it } from 'vitest'

import { normalizeWeaponProficiencyGrantSet } from './class-weapon-proficiency-helpers'

describe('normalizeWeaponProficiencyGrantSet', () => {
  it('returns categories only when the toggle is off', () => {
    expect(
      normalizeWeaponProficiencyGrantSet({
        categories: ['simple', 'martial'],
        items: ['dagger'],
        hasSpecificWeapons: false,
      }),
    ).toEqual({ categories: ['simple', 'martial'], items: [] })
  })

  it('returns named weapons only when the toggle is on', () => {
    expect(
      normalizeWeaponProficiencyGrantSet({
        categories: ['simple'],
        items: ['dagger', 'longsword'],
        hasSpecificWeapons: true,
      }),
    ).toEqual({ categories: [], items: ['dagger', 'longsword'] })
  })

  it('returns empty categories when individual mode is on with no items selected', () => {
    expect(
      normalizeWeaponProficiencyGrantSet({
        categories: ['simple'],
        items: [],
        hasSpecificWeapons: true,
      }),
    ).toEqual({ categories: [], items: [] })
  })
})
