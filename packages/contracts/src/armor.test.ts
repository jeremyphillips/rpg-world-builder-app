import { describe, expect, it } from 'vitest'
import { ARMOR_CATEGORIES, armorCategorySchema } from './armor'

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
