import { describe, expect, it } from 'vitest'

import {
  FEAT_CATEGORY_IDS,
  FEAT_PART_IDS,
  getFeatCategoryEntry,
  getFeatCategoryLabel,
  getFeatCategorySentenceForm,
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

  it('returns counted feat sentence forms', () => {
    expect(getFeatCategorySentenceForm('general', 1)).toBe('general feat')
    expect(getFeatCategorySentenceForm('general', 2)).toBe('general feats')
    expect(getFeatCategorySentenceForm('fighting-style', 1)).toBe('fighting style feat')
  })
})

describe('feat part vocabulary', () => {
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
