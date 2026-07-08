import { describe, expect, it } from 'vitest'

import {
  ARMOR_CATEGORIES,
  ARMOR_CATEGORY_ENTRIES,
  armorCategorySchema,
  getArmorCategoryCompactLabel,
  getArmorCategoryEntry,
  getArmorCategoryLabel,
  getArmorCategoryScopeForm,
  getArmorCategorySentenceForm,
} from './category'

describe('armorCategorySchema', () => {
  it('accepts every known armor category', () => {
    for (const category of ARMOR_CATEGORIES) {
      expect(armorCategorySchema.parse(category)).toBe(category)
    }
  })

  it('rejects unknown categories', () => {
    expect(armorCategorySchema.safeParse('plate').success).toBe(false)
  })
})

describe('armor category vocabulary', () => {
  it('exposes every category in ARMOR_CATEGORIES', () => {
    expect([...ARMOR_CATEGORIES].sort()).toEqual(Object.keys(ARMOR_CATEGORY_ENTRIES).sort())
  })

  it('has a label and description for every category', () => {
    for (const category of ARMOR_CATEGORIES) {
      const entry = getArmorCategoryEntry(category)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown categories', () => {
    expect(getArmorCategoryLabel('light')).toBe('Light Armor')
    expect(getArmorCategoryLabel('custom')).toBe('custom')
  })

  it('returns sentence, scope, and compact forms', () => {
    expect(getArmorCategorySentenceForm('light', 2)).toBe('suits of light armor')
    expect(getArmorCategoryScopeForm('heavy')).toBe('heavy armor')
    expect(getArmorCategoryScopeForm('shields')).toBe('shield')
    expect(getArmorCategoryCompactLabel('light')).toBe('Light armor')
    expect(getArmorCategoryCompactLabel('shields')).toBe('Shield')
  })
})
