import { describe, expect, it } from 'vitest'
import { WEAPON_CATEGORIES, weaponCategorySchema } from './weapon'

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
