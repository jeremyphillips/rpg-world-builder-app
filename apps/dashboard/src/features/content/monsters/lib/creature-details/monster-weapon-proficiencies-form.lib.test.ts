import { describe, expect, it } from 'vitest'

import {
  coerceCreatureWeaponProficienciesForForm,
  weaponProficiencyHydrationFromWeapons,
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

describe('weaponProficiencyHydrationFromWeapons', () => {
  it('uses specific mode when item grants are present', () => {
    expect(
      weaponProficiencyHydrationFromWeapons({ categories: [], items: ['srd:dagger'] }),
    ).toEqual({ mode: 'specific', reconciliationPending: false })
  })

  it('uses categories mode when only categories are present', () => {
    expect(weaponProficiencyHydrationFromWeapons({ categories: ['simple'], items: [] })).toEqual({
      mode: 'categories',
      reconciliationPending: false,
    })
  })

  it('uses none mode when grant set is empty', () => {
    expect(weaponProficiencyHydrationFromWeapons({ categories: [], items: [] })).toEqual({
      mode: 'none',
      reconciliationPending: false,
    })
  })

  it('flags reconciliation when both branches are stored', () => {
    expect(
      weaponProficiencyHydrationFromWeapons({ categories: ['simple'], items: ['srd:dagger'] }),
    ).toEqual({ mode: 'categories', reconciliationPending: true })
  })
})
