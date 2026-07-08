import { describe, expect, it } from 'vitest'

import {
  WEAPON_CATEGORIES,
  WEAPON_CATEGORY_ENTRIES,
  getWeaponCategoryCompactLabel,
  getWeaponCategoryEntry,
  getWeaponCategoryLabel,
  getWeaponCategorySentenceForm,
  weaponCategorySchema,
} from './category'

describe('weaponCategorySchema', () => {
  it('accepts every known weapon category', () => {
    for (const category of WEAPON_CATEGORIES) {
      expect(weaponCategorySchema.parse(category)).toBe(category)
    }
  })

  it('rejects unknown categories', () => {
    expect(weaponCategorySchema.safeParse('exotic').success).toBe(false)
  })
})

describe('weapon category vocabulary', () => {
  it('exposes every category in WEAPON_CATEGORIES', () => {
    expect([...WEAPON_CATEGORIES].sort()).toEqual(Object.keys(WEAPON_CATEGORY_ENTRIES).sort())
  })

  it('has a label and description for every category', () => {
    for (const category of WEAPON_CATEGORIES) {
      const entry = getWeaponCategoryEntry(category)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown categories', () => {
    expect(getWeaponCategoryLabel('simple')).toBe('Simple Weapon')
    expect(getWeaponCategoryLabel('custom')).toBe('custom')
  })

  it('returns sentence and compact forms', () => {
    expect(getWeaponCategorySentenceForm('simple', 1)).toBe('simple weapon')
    expect(getWeaponCategorySentenceForm('simple', 2)).toBe('simple weapons')
    expect(getWeaponCategoryCompactLabel('simple')).toBe('Simple weapons')
    expect(getWeaponCategoryCompactLabel('martial')).toBe('Martial weapons')
  })
})
