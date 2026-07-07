import { describe, expect, it } from 'vitest'

import {
  countPickerItemsByTab,
  filterPickerItemsByTab,
  rankPickerItems,
} from './catalog-picker-sheet.lib'

describe('catalog-picker-sheet.lib', () => {
  const items = [
    { id: 'a', text: 'Longsword', tab: 'featured' },
    { id: 'b', text: 'Rope', tab: 'all' },
    { id: 'c', text: 'Lantern', tab: 'featured' },
  ]

  it('ranks items by search text', () => {
    expect(rankPickerItems(items, 'rope', (item) => item.text).map((item) => item.id)).toEqual([
      'b',
    ])
  })

  it('filters items by active tab', () => {
    expect(
      filterPickerItemsByTab(items, 'featured', (item) => item.tab).map((item) => item.id),
    ).toEqual(['a', 'c'])
  })

  it('counts items per tab', () => {
    expect(countPickerItemsByTab(items, ['featured', 'all'], (item) => item.tab)).toEqual({
      featured: 2,
      all: 1,
    })
  })
})
