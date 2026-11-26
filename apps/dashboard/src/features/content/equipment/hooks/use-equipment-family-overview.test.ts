// @vitest-environment jsdom

import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { CatalogOverlayListFailure } from '@rpg/contracts'
import { useEquipmentFamilyOverview } from './use-equipment-family-overview'

vi.mock('@/lib/use-campaign-ruleset-lookup', () => ({
  useCampaignRulesetLookup: vi.fn(() => ({
    rulesetId: 'srd-cc-5.2.1',
    isPending: false,
    isError: false,
  })),
}))

vi.mock('../hooks/use-equipment', () => ({
  useEquipmentListResult: vi.fn(() => ({
    data: undefined,
    isPending: false,
    isError: false,
  })),
  useEquipmentUsageMeta: vi.fn(() => ({
    data: undefined,
  })),
}))

vi.mock('../hooks/use-family-table-config', () => ({
  useFamilyTableConfig: vi.fn(() => ({
    tableConfig: { columns: [], filterSchema: {} },
    isPending: false,
    isError: false,
  })),
}))

vi.mock('../../lib/forms/registry/resolve-catalog-seed-body.lib', () => ({
  resolveCatalogSeedBody: vi.fn((_type: string, _ruleset: string, id: string) => {
    if (id.includes('longsword')) return { kind: 'weapon' }
    if (id.includes('chain-mail')) return { kind: 'armor' }
    return undefined
  }),
}))

const { useEquipmentListResult } = await import('../hooks/use-equipment')

const { useCampaignRulesetLookup } = await import('@/lib/use-campaign-ruleset-lookup')

describe('useEquipmentFamilyOverview', () => {
  it('defers overlay failure rows until campaign ruleset is ready', () => {
    vi.mocked(useCampaignRulesetLookup).mockReturnValue({
      rulesetId: undefined,
      isPending: true,
      isError: false,
    })
    const failures: CatalogOverlayListFailure[] = [
      {
        targetId: 'srd-cc-5.2.1:longsword',
        slug: 'longsword',
        name: 'Longsword',
        code: 'unsupported_overlay_version',
        message: 'System overlay patch is missing a supported version.',
      },
    ]
    vi.mocked(useEquipmentListResult).mockReturnValue({
      data: { items: [], overlayFailures: failures },
      isPending: false,
      isError: false,
    })

    const { result } = renderHook(() => useEquipmentFamilyOverview('camp-1', 'weapons'))

    expect(result.current.isPending).toBe(true)
    expect(result.current.filtered).toEqual([])
  })

  it('includes unclassified overlay failures when ruleset lookup fails', () => {
    vi.mocked(useCampaignRulesetLookup).mockReturnValue({
      rulesetId: undefined,
      isPending: false,
      isError: true,
    })
    const failures: CatalogOverlayListFailure[] = [
      {
        targetId: 'srd-cc-5.2.1:longsword',
        slug: 'longsword',
        name: 'Longsword',
        code: 'unsupported_overlay_version',
        message: 'System overlay patch is missing a supported version.',
      },
      {
        targetId: 'srd-cc-5.2.1:chain-mail',
        slug: 'chain-mail',
        name: 'Chain Mail',
        code: 'unsupported_overlay_version',
        message: 'System overlay patch is missing a supported version.',
      },
    ]
    vi.mocked(useEquipmentListResult).mockReturnValue({
      data: {
        items: [{ id: 'hb-weapon', kind: 'weapon', name: 'HB Weapon' } as never],
        overlayFailures: failures,
      },
      isPending: false,
      isError: false,
    })

    const { result } = renderHook(() => useEquipmentFamilyOverview('camp-1', 'weapons'))

    expect(result.current.isError).toBe(false)
    expect(result.current.rulesetLookupFailed).toBe(true)
    expect(result.current.filtered.map((row) => row.id)).toEqual(['hb-weapon'])
    expect(result.current.unclassifiedOverlayFailures.map((row) => row.id)).toEqual([
      'srd-cc-5.2.1:longsword',
      'srd-cc-5.2.1:chain-mail',
    ])
  })

  it('keeps overlay failure rows in the matching equipment family using campaign ruleset context', () => {
    vi.mocked(useCampaignRulesetLookup).mockReturnValue({
      rulesetId: 'srd-cc-5.2.1',
      isPending: false,
      isError: false,
    })
    const failures: CatalogOverlayListFailure[] = [
      {
        targetId: 'srd-cc-5.2.1:longsword',
        slug: 'longsword',
        name: 'Longsword',
        code: 'unsupported_overlay_version',
        message: 'System overlay patch is missing a supported version.',
      },
      {
        targetId: 'srd-cc-5.2.1:chain-mail',
        slug: 'chain-mail',
        name: 'Chain Mail',
        code: 'unsupported_overlay_version',
        message: 'System overlay patch is missing a supported version.',
      },
    ]
    vi.mocked(useEquipmentListResult).mockReturnValue({
      data: {
        items: [{ id: 'hb-weapon', kind: 'weapon', name: 'HB Weapon' } as never],
        overlayFailures: failures,
      },
      isPending: false,
      isError: false,
    })

    const { result } = renderHook(() => useEquipmentFamilyOverview('camp-1', 'weapons'))

    expect(result.current.filtered.map((row) => row.id)).toEqual([
      'hb-weapon',
      'srd-cc-5.2.1:longsword',
    ])
  })

  it('treats ruleset lookup failure as a full-page error when the equipment list also failed', () => {
    vi.mocked(useCampaignRulesetLookup).mockReturnValue({
      rulesetId: undefined,
      isPending: false,
      isError: true,
    })
    vi.mocked(useEquipmentListResult).mockReturnValue({
      data: undefined,
      isPending: false,
      isError: true,
    })

    const { result } = renderHook(() => useEquipmentFamilyOverview('camp-1', 'weapons'))

    expect(result.current.isError).toBe(true)
    expect(result.current.rulesetLookupFailed).toBe(false)
  })
})
