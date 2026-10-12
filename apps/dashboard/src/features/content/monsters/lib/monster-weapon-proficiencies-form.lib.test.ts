import { describe, expect, it } from 'vitest'

import {
  coerceCreatureWeaponProficienciesForForm,
  weaponProficiencyModeFromFormWeapons,
} from './monster-weapon-proficiencies-form.lib'

describe('coerceCreatureWeaponProficienciesForForm', () => {
  it('folds legacy target rows into a grant set', () => {
    expect(
      coerceCreatureWeaponProficienciesForForm([
        { weaponId: 'srd:dagger' },
        { weaponCategory: 'simple' },
      ]),
    ).toEqual({
      categories: ['simple'],
      items: ['srd:dagger'],
    })
  })

  it('passes through a valid grant set', () => {
    expect(
      coerceCreatureWeaponProficienciesForForm({
        categories: ['martial'],
        items: [],
      }),
    ).toEqual({
      categories: ['martial'],
      items: [],
    })
  })

  it('returns empty grant set when weapons is not grant-shaped', () => {
    expect(coerceCreatureWeaponProficienciesForForm(undefined)).toEqual({
      categories: [],
      items: [],
    })
  })
})

describe('weaponProficiencyModeFromFormWeapons', () => {
  it('uses individual mode when item grants are present', () => {
    expect(weaponProficiencyModeFromFormWeapons({ categories: [], items: ['srd:dagger'] })).toBe(
      'individual',
    )
  })

  it('uses categories mode when only categories are present', () => {
    expect(weaponProficiencyModeFromFormWeapons({ categories: ['simple'], items: [] })).toBe(
      'categories',
    )
  })
})
