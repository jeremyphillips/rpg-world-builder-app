import { describe, expect, it } from 'vitest'

import { formatSlugAsLabel } from './format-slug'

describe('formatSlugAsLabel', () => {
  it('title-cases hyphenated slugs', () => {
    expect(formatSlugAsLabel('orphan-slug')).toBe('Orphan Slug')
    expect(formatSlugAsLabel('custom-fighter')).toBe('Custom Fighter')
  })

  it('title-cases single-word slugs', () => {
    expect(formatSlugAsLabel('fighter')).toBe('Fighter')
    expect(formatSlugAsLabel('paladin')).toBe('Paladin')
  })
})
