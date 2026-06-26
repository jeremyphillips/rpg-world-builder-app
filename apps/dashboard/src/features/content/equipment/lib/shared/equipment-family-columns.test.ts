import { describe, expect, it, vi } from 'vitest'

import { loadFamilyTableConfig } from './equipment-family-columns'

vi.mock('../../weapons/components/weapon-columns', () => ({
  weaponColumns: () => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'category', header: 'Category' },
  ],
  weaponFilters: [{ id: 'category', label: 'Category' }],
}))

describe('loadFamilyTableConfig', () => {
  it('loads only the requested family column module', async () => {
    const config = await loadFamilyTableConfig('campaign-1', 'weapons')

    expect(config.columns.length).toBeGreaterThan(0)
    expect(config.filters.length).toBeGreaterThan(0)
    expect(
      config.columns.some((column) => 'accessorKey' in column && column.accessorKey === 'name'),
    ).toBe(true)
  })
})
