import { describe, expect, it } from 'vitest'

import {
  getMagicItemCategoryEntry,
  getMagicItemCategoryLabel,
  getMagicItemCategorySentenceForm,
  MAGIC_ITEM_CATEGORIES,
  MAGIC_ITEM_CATEGORY_ENTRIES,
  magicItemCategorySchema,
} from './category'

describe('magicItemCategorySchema', () => {
  it('matches MAGIC_ITEM_CATEGORIES', () => {
    expect(magicItemCategorySchema.options).toEqual([...MAGIC_ITEM_CATEGORIES])
  })

  it('rejects unknown categories', () => {
    expect(magicItemCategorySchema.safeParse('artifact').success).toBe(false)
  })
})

describe('magic item category vocabulary', () => {
  it('has a label and description for every category', () => {
    for (const category of MAGIC_ITEM_CATEGORIES) {
      const entry = getMagicItemCategoryEntry(category)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('derives labels from the entry map', () => {
    for (const category of MAGIC_ITEM_CATEGORIES) {
      expect(getMagicItemCategoryLabel(category)).toBe(MAGIC_ITEM_CATEGORY_ENTRIES[category].label)
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getMagicItemCategoryLabel('wondrous_item')).toBe('Wondrous Item')
    expect(getMagicItemCategoryLabel('custom')).toBe('custom')
  })

  it('returns counted magic item category sentence forms', () => {
    expect(getMagicItemCategorySentenceForm('wondrous_item', 1)).toBe('wondrous item')
    expect(getMagicItemCategorySentenceForm('wondrous_item', 2)).toBe('wondrous items')
    expect(getMagicItemCategorySentenceForm('staff', 2)).toBe('magic staves')
    expect(getMagicItemCategorySentenceForm('armor', 1)).toBe('suit of magic armor')
  })
})
