import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { FamilyTableConfig } from '../lib/shared/equipment-family-overview-columns'
import * as equipmentFamilyColumns from '../lib/shared/equipment-family-overview-columns'
import { useFamilyTableConfig } from './use-family-table-config'

vi.mock('../lib/shared/equipment-family-overview-columns', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof equipmentFamilyColumns
  return {
    ...actual,
    loadFamilyTableConfig: vi.fn(),
  }
})

const { loadFamilyTableConfig } = equipmentFamilyColumns

const mockConfig: FamilyTableConfig = {
  columns: [{ accessorKey: 'name', header: 'Name' }],
  filterSchema: { fields: [] },
}

describe('useFamilyTableConfig', () => {
  it('loads table config for the requested family', async () => {
    vi.mocked(loadFamilyTableConfig).mockResolvedValue(mockConfig)

    const { result } = renderHook(() => useFamilyTableConfig('campaign-1', 'weapons'))

    await waitFor(() => {
      expect(result.current.tableConfig).toEqual(mockConfig)
    })

    expect(loadFamilyTableConfig).toHaveBeenCalledWith('campaign-1', 'weapons')
    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('sets isError when loading fails', async () => {
    vi.mocked(loadFamilyTableConfig).mockRejectedValue(new Error('load failed'))

    const { result } = renderHook(() => useFamilyTableConfig('campaign-1', 'armor'))

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.isPending).toBe(false)
    expect(result.current.tableConfig).toBeNull()
  })
})
