import { describe, expect, it } from 'vitest'

import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { buildContentViewerFromMembership } from './build-content-viewer'
import { filterCatalogForMembership } from './filter-catalog-for-viewer'

describe('buildContentViewerFromMembership', () => {
  it('maps manager roles to manage viewer', () => {
    expect(
      buildContentViewerFromMembership({ campaignRole: 'owner', controlledCharacterIds: [] }),
    ).toEqual({
      kind: 'manage',
    })
    expect(
      buildContentViewerFromMembership({
        campaignRole: 'co-owner',
        controlledCharacterIds: ['pc-1'],
      }),
    ).toEqual({ kind: 'manage' })
  })

  it('maps pc memberships with characters to pc viewer', () => {
    expect(
      buildContentViewerFromMembership({
        campaignRole: 'pc',
        controlledCharacterIds: ['pc-1', 'pc-2'],
      }),
    ).toEqual({ kind: 'pc', characterIds: ['pc-1', 'pc-2'] })
  })

  it('maps observers and pcs without characters to none viewer', () => {
    expect(
      buildContentViewerFromMembership({ campaignRole: 'observer', controlledCharacterIds: [] }),
    ).toEqual({ kind: 'none' })
    expect(
      buildContentViewerFromMembership({ campaignRole: 'pc', controlledCharacterIds: [] }),
    ).toEqual({
      kind: 'none',
    })
  })
})

describe('filterCatalogForMembership', () => {
  const baseRow = {
    id: 'feat-1',
    status: 'published' as const,
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  }

  it('hides drafts from non-managers but keeps them for managers', () => {
    const draftRow = { ...baseRow, id: 'draft', status: 'draft' as const }
    const rows = [baseRow, draftRow]

    expect(
      filterCatalogForMembership(rows, { campaignRole: 'pc', pcCharacterIds: ['pc-1'] }),
    ).toEqual([baseRow])
    expect(filterCatalogForMembership(rows, { campaignRole: 'owner', pcCharacterIds: [] })).toEqual(
      rows,
    )
  })

  it('hides restricted rows from non-managers while managers see them', () => {
    const hiddenRow = {
      ...baseRow,
      id: 'hidden',
      campaignAccess: {
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        available: false,
        effectiveAudience: 'none' as const,
      },
    }
    const rows = [baseRow, hiddenRow]
    const pcMembership = { campaignRole: 'pc', pcCharacterIds: ['pc-1'] }

    expect(filterCatalogForMembership(rows, pcMembership)).toEqual([baseRow])
    expect(filterCatalogForMembership(rows, { campaignRole: 'owner', pcCharacterIds: [] })).toEqual(
      rows,
    )
  })
})
