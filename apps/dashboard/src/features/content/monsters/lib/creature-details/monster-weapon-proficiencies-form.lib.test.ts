import { describe, expect, it } from 'vitest'

import {
  coerceCreatureWeaponProficienciesForForm,
  MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
  weaponProficiencyHydrationFromWeapons,
} from './monster-weapon-proficiencies-form.lib'
import { resolveMonsterCreateDefaultValues } from '../monster-form-values'

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

describe('monster weapon proficiency defaults', () => {
  it('defaults new monsters to specific mode', () => {
    expect(resolveMonsterCreateDefaultValues().weaponProficiencyMode).toBe(
      MONSTER_DEFAULT_WEAPON_PROFICIENCY_MODE,
    )
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

  it('uses specific mode when grant set is empty', () => {
    expect(weaponProficiencyHydrationFromWeapons({ categories: [], items: [] })).toEqual({
      mode: 'specific',
      reconciliationPending: false,
    })
  })

  it('flags reconciliation when both branches are stored', () => {
    expect(
      weaponProficiencyHydrationFromWeapons({ categories: ['simple'], items: ['srd:dagger'] }),
    ).toEqual({ mode: 'categories', reconciliationPending: true })
  })
})
