import { describe, expect, it } from 'vitest'

import { loadFamilyTableConfig } from './equipment-family-columns'

describe('loadFamilyTableConfig', () => {
  it('loads only the requested family column module', async () => {
    const config = await loadFamilyTableConfig('campaign-1', 'weapons')

    expect(config.columns.length).toBeGreaterThan(0)
    expect(config.filters.length).toBeGreaterThan(0)
    expect(config.columns.some((column) => 'accessorKey' in column && column.accessorKey === 'name')).toBe(
      true,
    )
  })
})
