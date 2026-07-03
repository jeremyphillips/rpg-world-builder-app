import { describe, expect, it } from 'vitest'

import {
  getServiceCategoryEntry,
  getServiceCategoryLabel,
  getServiceCategorySentenceForm,
  SERVICE_CATEGORIES,
  SERVICE_CATEGORY_ENTRIES,
  serviceCategorySchema,
} from './service-category'

describe('serviceCategorySchema', () => {
  it('accepts every known service category', () => {
    for (const category of SERVICE_CATEGORIES) {
      expect(serviceCategorySchema.parse(category)).toBe(category)
    }
  })

  it('rejects unknown categories', () => {
    expect(serviceCategorySchema.safeParse('healing').success).toBe(false)
  })
})

describe('service category vocabulary', () => {
  it('has a label and description for every category', () => {
    for (const category of SERVICE_CATEGORIES) {
      const entry = getServiceCategoryEntry(category)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('derives labels from the entry map', () => {
    for (const category of SERVICE_CATEGORIES) {
      expect(getServiceCategoryLabel(category)).toBe(SERVICE_CATEGORY_ENTRIES[category].label)
    }
  })

  it('returns counted service category sentence forms', () => {
    expect(getServiceCategorySentenceForm('travel', 1)).toBe('travel service')
    expect(getServiceCategorySentenceForm('travel', 2)).toBe('travel services')
    expect(getServiceCategorySentenceForm('spellcasting', 2)).toBe('spellcasting services')
  })
})
