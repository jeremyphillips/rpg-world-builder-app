import { describe, expect, it, vi } from 'vitest'

import type { CatalogOverlayListFailure } from '@rpg/contracts'

import { overlayFailureOverviewRows } from '../../lib/list/create-content-list'
import {
  equipmentFamilyOverviewAwaitingRulesetForFailures,
  equipmentFamilyUnclassifiedOverlayFailures,
  filterEquipmentFamilyOverviewRows,
} from './equipment-family-overview-filter.lib'

vi.mock('../../lib/forms/registry/resolve-catalog-seed-body.lib', () => ({
  resolveCatalogSeedBody: vi.fn((_type: string, _ruleset: string, id: string) => {
    if (id.includes('longsword')) return { kind: 'weapon' }
    if (id.includes('chain-mail')) return { kind: 'armor' }
    return undefined
  }),
}))

function overlayFailure(id: string): CatalogOverlayListFailure {
  return {
    targetId: id,
    slug: id,
    name: id,
    code: 'unsupported_overlay_version',
    message: 'bad',
  }
}

describe('filterEquipmentFamilyOverviewRows', () => {
  const failures = [overlayFailure('srd:longsword'), overlayFailure('srd:chain-mail')]

  it('returns empty while ruleset is pending when overlay failures are present', () => {
    const rows = [
      { id: 'w1', kind: 'weapon' as const, name: 'HB' },
      ...overlayFailureOverviewRows(failures),
    ]
    expect(
      filterEquipmentFamilyOverviewRows(rows, 'weapons', {
        rulesetId: undefined,
        isPending: true,
        isError: false,
      }),
    ).toEqual([])
    expect(
      equipmentFamilyOverviewAwaitingRulesetForFailures(rows, {
        rulesetId: undefined,
        isPending: true,
        isError: false,
      }),
    ).toBe(true)
  })

  it('filters resolved rows by kind when ruleset is pending and there are no overlay failures', () => {
    const rows = [
      { id: 'w1', kind: 'weapon' as const, name: 'W' },
      { id: 'a1', kind: 'armor' as const, name: 'A' },
    ]
    expect(
      filterEquipmentFamilyOverviewRows(rows, 'weapons', {
        rulesetId: undefined,
        isPending: true,
        isError: false,
      }),
    ).toEqual([rows[0]])
  })

  it('classifies overlay failures by seed kind when ruleset is resolved', () => {
    const rows = [
      { id: 'w1', kind: 'weapon' as const, name: 'HB' },
      ...overlayFailureOverviewRows(failures),
    ]
    expect(
      filterEquipmentFamilyOverviewRows(rows, 'weapons', {
        rulesetId: 'srd-cc-5.2.1',
        isPending: false,
        isError: false,
      }).map((row) => row.id),
    ).toEqual(['w1', 'srd:longsword'])
  })

  it('omits overlay failures from the family table when ruleset lookup failed', () => {
    const rows = [
      { id: 'w1', kind: 'weapon' as const, name: 'HB' },
      ...overlayFailureOverviewRows(failures),
    ]
    const ruleset = { rulesetId: undefined, isPending: false, isError: true as const }
    expect(
      filterEquipmentFamilyOverviewRows(rows, 'weapons', ruleset).map((row) => row.id),
    ).toEqual(['w1'])
    expect(equipmentFamilyUnclassifiedOverlayFailures(rows, ruleset).map((row) => row.id)).toEqual([
      'srd:longsword',
      'srd:chain-mail',
    ])
  })
})
