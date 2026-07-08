import { describe, expect, it } from 'vitest'

import {
  TOOL_CATEGORIES,
  getToolCategoryLabel,
  getToolCategorySentenceForm,
  toolCategorySchema,
} from './tool-category'

describe('toolCategorySchema', () => {
  it('accepts every known tool category', () => {
    for (const category of TOOL_CATEGORIES) {
      expect(toolCategorySchema.parse(category)).toBe(category)
    }
  })
})

describe('tool category vocabulary', () => {
  it('returns labels and sentence forms', () => {
    expect(getToolCategoryLabel('gaming_set')).toBe('Gaming Set')
    expect(getToolCategorySentenceForm('gaming_set', 2)).toBe('gaming sets')
    expect(getToolCategorySentenceForm('thieves', 2)).toBe("sets of thieves' tools")
    expect(getToolCategorySentenceForm('musical_instrument', 1)).toBe('musical instrument')
  })
})
