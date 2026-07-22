import { describe, expect, it } from 'vitest'

import { hasDirtyFields } from './form-dirty-state'

describe('hasDirtyFields', () => {
  it('returns false for an empty dirty map', () => {
    expect(hasDirtyFields({})).toBe(false)
  })

  it('returns true when a top-level field is dirty', () => {
    expect(hasDirtyFields({ name: true })).toBe(true)
  })

  it('returns true when a nested field is dirty', () => {
    expect(hasDirtyFields({ profile: { name: true } })).toBe(true)
  })

  it('returns true when a deeply nested array field is dirty', () => {
    expect(hasDirtyFields({ traits: [{ name: true }] })).toBe(true)
  })

  it('returns false when nested objects contain no dirty leaves', () => {
    expect(hasDirtyFields({ profile: { name: false } })).toBe(false)
  })
})
