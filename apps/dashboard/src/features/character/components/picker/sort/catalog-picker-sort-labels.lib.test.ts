import { describe, expect, it } from 'vitest'

import { pickerSortOption } from './catalog-picker-sort-labels.lib'

describe('catalog-picker-sort-labels.lib', () => {
  it('stores explicit trigger labels on options', () => {
    expect(pickerSortOption('name_asc', 'Name: A–Z', 'A–Z').triggerLabel).toBe('A–Z')
    expect(pickerSortOption('best_match', 'Best match', 'Best match').triggerLabel).toBe(
      'Best match',
    )
  })
})
