import { describe, expect, it } from 'vitest'

import { isEmptyProficiencyGrantSet } from './proficiency-grant-set'

describe('isEmptyProficiencyGrantSet', () => {
  it('returns true when both categories and items are empty', () => {
    expect(isEmptyProficiencyGrantSet({ categories: [], items: [] })).toBe(true)
  })

  it('returns false when categories or items are present', () => {
    expect(isEmptyProficiencyGrantSet({ categories: ['light'], items: [] })).toBe(false)
    expect(isEmptyProficiencyGrantSet({ categories: [], items: ['longsword'] })).toBe(false)
  })
})
