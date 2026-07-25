import { describe, expect, it } from 'vitest'

import { formatCatalogResultCount } from './format-catalog-result-count.lib'

describe('formatCatalogResultCount', () => {
  it('uses singular copy for one row', () => {
    expect(formatCatalogResultCount(1)).toBe('1 result')
  })

  it('uses plural copy for multiple rows', () => {
    expect(formatCatalogResultCount(4)).toBe('4 results')
  })
})
