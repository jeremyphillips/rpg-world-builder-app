import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { FamilyTableConfig } from '../lib/shared/equipment-family-overview-columns'
import * as equipmentFamilyColumns from '../lib/shared/equipment-family-overview-columns'
import { useFamilyTableConfig } from './use-family-table-config'

const rulesQuery = vi.hoisted(() => ({
  data: undefined as undefined | { mechanics: { armorClass: { mode: 'ascending'; base: 10 } } },
  isPending: false,
  isError: false,
}))

vi.mock('@/features/homebrew', () => ({
  useRulesetPatch: () => rulesQuery,
}))

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
  beforeEach(() => {
    rulesQuery.data = undefined
    rulesQuery.isPending = false
    rulesQuery.isError = false
    vi.mocked(loadFamilyTableConfig).mockReset()
  })

  it('loads table config for the requested family', async () => {
    vi.mocked(loadFamilyTableConfig).mockResolvedValue(mockConfig)

    const { result } = renderHook(() => useFamilyTableConfig('campaign-1', 'weapons'))

    await waitFor(() => {
      expect(result.current.tableConfig).toEqual(mockConfig)
    })

    expect(loadFamilyTableConfig).toHaveBeenCalledWith(
      'campaign-1',
      'weapons',
      undefined,
      undefined,
    )
    expect(result.current.isPending).toBe(false)
    expect(result.current.isError).toBe(false)
  })

  it('sets isError when loading fails', async () => {
    vi.mocked(loadFamilyTableConfig).mockRejectedValue(new Error('load failed'))

    const { result } = renderHook(() => useFamilyTableConfig('campaign-1', 'weapons'))

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.isPending).toBe(false)
    expect(result.current.tableConfig).toBeNull()
  })

  it('waits for Armor Class rules before loading armor columns', () => {
    rulesQuery.isPending = true
    const { result } = renderHook(() => useFamilyTableConfig('campaign-1', 'armor'))

    expect(loadFamilyTableConfig).not.toHaveBeenCalled()
    expect(result.current.isPending).toBe(true)
    expect(result.current.tableConfig).toBeNull()
  })

  it('surfaces a ruleset error for armor without loading a default', () => {
    rulesQuery.isError = true
    const { result } = renderHook(() => useFamilyTableConfig('campaign-1', 'armor'))

    expect(loadFamilyTableConfig).not.toHaveBeenCalled()
    expect(result.current.isError).toBe(true)
    expect(result.current.tableConfig).toBeNull()
  })
})
