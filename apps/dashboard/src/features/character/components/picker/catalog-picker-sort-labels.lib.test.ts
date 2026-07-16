import { describe, expect, it } from 'vitest'

import { pickerSortOption, resolvePickerSortTriggerLabel } from './catalog-picker-sort-labels.lib'

describe('catalog-picker-sort-labels.lib', () => {
  it('compacts name sort labels in picker triggers', () => {
    expect(resolvePickerSortTriggerLabel(pickerSortOption('name-asc', 'Name: A–Z'))).toBe('A–Z')
    expect(resolvePickerSortTriggerLabel(pickerSortOption('name-desc', 'Name: Z–A'))).toBe('Z–A')
  })

  it('keeps non-name sort labels unchanged in triggers', () => {
    expect(resolvePickerSortTriggerLabel(pickerSortOption('best-match', 'Best match'))).toBe(
      'Best match',
    )
  })
})
