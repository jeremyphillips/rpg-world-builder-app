import { describe, expect, it } from 'vitest'

import { normalizeWeaponProficiencyGrantSet } from './class-weapon-proficiency-helpers'

describe('normalizeWeaponProficiencyGrantSet', () => {
  it('returns empty grant when mode is none', () => {
    expect(
      normalizeWeaponProficiencyGrantSet({
        categories: ['simple', 'martial'],
        items: ['dagger'],
        mode: 'none',
      }),
    ).toEqual({ categories: [], items: [] })
  })

  it('returns categories only when mode is categories', () => {
    expect(
      normalizeWeaponProficiencyGrantSet({
        categories: ['simple', 'martial'],
        items: ['dagger'],
        mode: 'categories',
      }),
    ).toEqual({ categories: ['simple', 'martial'], items: [] })
  })

  it('returns named weapons only when mode is specific', () => {
    expect(
      normalizeWeaponProficiencyGrantSet({
        categories: ['simple'],
        items: ['dagger', 'longsword'],
        mode: 'specific',
      }),
    ).toEqual({ categories: [], items: ['dagger', 'longsword'] })
  })
})
