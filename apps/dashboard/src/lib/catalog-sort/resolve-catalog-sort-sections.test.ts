import { describe, expect, it } from 'vitest'

import { resolveCatalogSortSections } from './resolve-catalog-sort-sections'

describe('resolveCatalogSortSections', () => {
  it('renders presets ungrouped above headed axis groups', () => {
    const sections = resolveCatalogSortSections({
      axes: ['name', 'price'],
      presets: ['best_match'],
    })

    expect(sections).toEqual([
      {
        type: 'ungrouped',
        options: [{ value: 'best_match', label: 'Best match', triggerLabel: 'Best match' }],
      },
      {
        type: 'group',
        heading: 'Name',
        options: [
          { value: 'name_asc', label: 'A–Z', triggerLabel: 'Name: A–Z' },
          { value: 'name_desc', label: 'Z–A', triggerLabel: 'Name: Z–A' },
        ],
      },
      {
        type: 'group',
        heading: 'Price',
        options: [
          { value: 'price_asc', label: 'Low to high', triggerLabel: 'Price: Low' },
          { value: 'price_desc', label: 'High to low', triggerLabel: 'Price: High' },
        ],
      },
    ])
  })

  it('orders createdAt newest-first and gates values via availableValues', () => {
    const sections = resolveCatalogSortSections({
      axes: ['createdAt', 'price'],
      presets: ['best_match'],
      availableValues: ['best_match', 'date_desc', 'date_asc'],
    })

    expect(sections).toEqual([
      {
        type: 'ungrouped',
        options: [{ value: 'best_match', label: 'Best match', triggerLabel: 'Best match' }],
      },
      {
        type: 'group',
        heading: 'Date created',
        options: [
          { value: 'date_desc', label: 'Newest first', triggerLabel: 'Date: Newest' },
          { value: 'date_asc', label: 'Oldest first', triggerLabel: 'Date: Oldest' },
        ],
      },
    ])
  })

  it('omits preset section when presets are empty', () => {
    const sections = resolveCatalogSortSections({ axes: ['name'] })
    expect(sections).toHaveLength(1)
    expect(sections[0]).toMatchObject({ type: 'group', heading: 'Name' })
  })
})
