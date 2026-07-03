import { describe, expect, it } from 'vitest'

import {
  FEAT_CATEGORY_ENTRIES,
  FEAT_CATEGORY_IDS,
  FEAT_PART_ENTRIES,
  FEAT_PART_IDS,
  getFeatCategoryEntry,
  getFeatCategoryLabel,
  getFeatPartEntry,
  getFeatPartLabel,
  featCategorySchema,
} from './feat'

describe('featCategorySchema', () => {
  it('accepts every known feat category', () => {
    for (const id of FEAT_CATEGORY_IDS) {
      expect(featCategorySchema.parse(id)).toBe(id)
    }
  })

  it('derives ids from the category map', () => {
    expect(FEAT_CATEGORY_IDS).toEqual(Object.keys(FEAT_CATEGORY_ENTRIES))
  })

  it('rejects unknown categories', () => {
    expect(featCategorySchema.safeParse('custom').success).toBe(false)
  })
})

describe('feat category vocabulary', () => {
  it('has a label and description for every category', () => {
    for (const id of FEAT_CATEGORY_IDS) {
      const entry = getFeatCategoryEntry(id)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns labels and falls back for unknown ids', () => {
    expect(getFeatCategoryLabel('origin')).toBe('Origin')
    expect(getFeatCategoryLabel('custom')).toBe('custom')
  })
})

describe('feat part vocabulary', () => {
  it('derives part ids from the entry map', () => {
    expect(FEAT_PART_IDS).toEqual(Object.keys(FEAT_PART_ENTRIES))
  })

  it('has a label and description for every part', () => {
    for (const id of FEAT_PART_IDS) {
      const entry = getFeatPartEntry(id)
      expect(entry?.label).toBeTruthy()
      expect(entry?.description).toBeTruthy()
    }
  })

  it('returns part labels and falls back for unknown ids', () => {
    expect(getFeatPartLabel('benefit')).toBe('Benefit')
    expect(getFeatPartLabel('unknown')).toBe('unknown')
  })
})
