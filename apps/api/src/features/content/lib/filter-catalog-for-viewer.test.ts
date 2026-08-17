import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { filterCatalogForMembership } from './filter-catalog-for-viewer'

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

  it('scopes specific_players discovery to the requested play actor character id', () => {
    const restrictedRow = {
      ...baseRow,
      id: 'restricted',
      campaignAccess: {
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        visibilityMode: 'specific_players' as const,
        participantIds: ['pc-a'],
      },
    }
    const rows = [baseRow, restrictedRow]
    const dualPcMembership = { campaignRole: 'pc', pcCharacterIds: ['pc-a', 'pc-b'] }

    expect(filterCatalogForMembership(rows, dualPcMembership)).toEqual(rows)
    expect(
      filterCatalogForMembership(rows, {
        ...dualPcMembership,
        playActorCharacterId: 'pc-a',
      }),
    ).toEqual(rows)
    expect(
      filterCatalogForMembership(rows, {
        ...dualPcMembership,
        playActorCharacterId: 'pc-b',
      }),
    ).toEqual([baseRow])
  })
})
