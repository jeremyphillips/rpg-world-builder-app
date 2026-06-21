import { describe, expect, it } from 'vitest'

import {
  normalizeClassWeaponProficiencies,
  specificWeaponFieldsAllowed,
} from './class-weapon-proficiency-helpers'

describe('specificWeaponFieldsAllowed', () => {
  it('allows specific weapons when fewer than all categories are selected', () => {
    expect(specificWeaponFieldsAllowed([])).toBe(true)
    expect(specificWeaponFieldsAllowed(['simple'])).toBe(true)
  })

  it('disallows specific weapons when both categories are selected', () => {
    expect(specificWeaponFieldsAllowed(['simple', 'martial'])).toBe(false)
  })
})

describe('normalizeClassWeaponProficiencies', () => {
  const categoryBySlug = {
    dagger: 'simple',
    longsword: 'martial',
  } as const

  it('omits items when the toggle is off', () => {
    expect(
      normalizeClassWeaponProficiencies({
        categories: [],
        items: ['dagger'],
        hasSpecificWeapons: false,
        categoryBySlug,
      }),
    ).toEqual({ categories: [] })
  })

  it('omits items when both categories are granted', () => {
    expect(
      normalizeClassWeaponProficiencies({
        categories: ['simple', 'martial'],
        items: ['dagger'],
        hasSpecificWeapons: true,
        categoryBySlug,
      }),
    ).toEqual({ categories: ['simple', 'martial'] })
  })

  it('strips items covered by a selected category', () => {
    expect(
      normalizeClassWeaponProficiencies({
        categories: ['simple'],
        items: ['dagger', 'longsword'],
        hasSpecificWeapons: true,
        categoryBySlug,
      }),
    ).toEqual({ categories: ['simple'], items: ['longsword'] })
  })

  it('prefers specific weapons when every selected item would be covered by a category', () => {
    expect(
      normalizeClassWeaponProficiencies({
        categories: ['simple'],
        items: ['dagger'],
        hasSpecificWeapons: true,
        categoryBySlug,
      }),
    ).toEqual({ categories: [], items: ['dagger'] })
  })
})
