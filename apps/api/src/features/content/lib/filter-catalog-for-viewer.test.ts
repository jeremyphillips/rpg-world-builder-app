import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'

import { filterCatalogForMembership, filterCatalogForPlayActor } from './filter-catalog-for-viewer'

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

describe('filterCatalogForPlayActor', () => {
  const baseRow = {
    id: 'class-1',
    status: 'published' as const,
    campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  }

  it('filters by playable policy without manager bypass', () => {
    const dmOnlyRow = {
      ...baseRow,
      id: 'dm-only',
      campaignAccess: {
        ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
        visibilityMode: 'dm_only' as const,
      },
    }
    const rows = [baseRow, dmOnlyRow]

    expect(
      filterCatalogForPlayActor(rows, {
        campaignRole: 'owner',
        playActor: { kind: 'new_pc' },
      }),
    ).toEqual([baseRow])
    expect(
      filterCatalogForPlayActor(rows, {
        campaignRole: 'owner',
        playActor: { kind: 'npc' },
      }),
    ).toEqual(rows)
  })

  it('excludes specific_players content for new_pc even when requester is a manager', () => {
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

    expect(
      filterCatalogForPlayActor(rows, {
        campaignRole: 'owner',
        playActor: { kind: 'new_pc' },
      }),
    ).toEqual([baseRow])
  })

  it('includes specific_players content only for the granted PC actor', () => {
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

    expect(
      filterCatalogForPlayActor(rows, {
        campaignRole: 'pc',
        playActor: { kind: 'pc', characterId: 'pc-a' },
      }),
    ).toEqual(rows)
    expect(
      filterCatalogForPlayActor(rows, {
        campaignRole: 'pc',
        playActor: { kind: 'pc', characterId: 'pc-b' },
      }),
    ).toEqual([baseRow])
  })

  it('hides drafts from non-managers', () => {
    const draftRow = { ...baseRow, id: 'draft', status: 'draft' as const }
    const rows = [baseRow, draftRow]

    expect(
      filterCatalogForPlayActor(rows, {
        campaignRole: 'pc',
        playActor: { kind: 'new_pc' },
      }),
    ).toEqual([baseRow])
    expect(
      filterCatalogForPlayActor(rows, {
        campaignRole: 'owner',
        playActor: { kind: 'new_pc' },
      }),
    ).toEqual(rows)
  })
})
