import { describe, expect, it } from 'vitest'

import { normalizeClassWeaponProficiencies } from './class-weapon-proficiency-helpers'

describe('normalizeClassWeaponProficiencies', () => {
  it('returns categories only when the toggle is off', () => {
    expect(
      normalizeClassWeaponProficiencies({
        categories: ['simple', 'martial'],
        items: ['dagger'],
        hasSpecificWeapons: false,
      }),
    ).toEqual({ categories: ['simple', 'martial'] })
  })

  it('returns named weapons only when the toggle is on', () => {
    expect(
      normalizeClassWeaponProficiencies({
        categories: ['simple'],
        items: ['dagger', 'longsword'],
        hasSpecificWeapons: true,
      }),
    ).toEqual({ categories: [], items: ['dagger', 'longsword'] })
  })

  it('returns empty categories when individual mode is on with no items selected', () => {
    expect(
      normalizeClassWeaponProficiencies({
        categories: ['simple'],
        items: [],
        hasSpecificWeapons: true,
      }),
    ).toEqual({ categories: [] })
  })
})
