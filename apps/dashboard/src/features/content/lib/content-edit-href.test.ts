import { describe, expect, it } from 'vitest'

import { contentEditHref } from './content-edit-href'

describe('contentEditHref', () => {
  it('returns edit href for types with edit routes', () => {
    expect(contentEditHref('species', 'c1', 's1')).toBe('/campaigns/c1/species/s1/edit')
    expect(contentEditHref('classes', 'c1', 'cl1')).toBe('/campaigns/c1/classes/cl1/edit')
  })

  it('returns undefined for types without edit routes', () => {
    expect(contentEditHref('spells', 'c1', 'sp1')).toBeUndefined()
  })
})
