import { describe, expect, it, vi } from 'vitest'

import { loadFamilyTableConfig } from './equipment-family-overview-columns'

vi.mock('../../weapons/lib/weapon-overview-columns', () => ({
  weaponColumns: () => [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'category', header: 'Category' },
  ],
  weaponFilterSchema: { fields: [{ id: 'category', label: 'Category' }] },
}))

describe('loadFamilyTableConfig', () => {
  it('loads only the requested family column module', async () => {
    const config = await loadFamilyTableConfig('campaign-1', 'weapons')

    expect(config.columns.length).toBeGreaterThan(0)
    expect(config.filterSchema.fields.length).toBeGreaterThan(0)
    expect(
      config.columns.some((column) => 'accessorKey' in column && column.accessorKey === 'name'),
    ).toBe(true)
  })
})
