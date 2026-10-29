import { CONTENT_CATALOG_REFERENCE_SCOPE, CONTENT_CATALOG_SCOPE_QUERY } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { applyCatalogListFilter } from './apply-catalog-list-filter'
import { resolveCatalogListFilter } from './resolve-catalog-membership-filter'

const membership = {
  campaignId: 'camp-1',
  userId: 'user-1',
  campaignRole: 'owner' as const,
  controlledCharacterIds: [],
  pcCharacterIds: [],
}

const playerMembership = {
  ...membership,
  campaignRole: 'pc' as const,
  pcCharacterIds: ['pc-1'],
}

describe('resolveCatalogListFilter reference scope', () => {
  it('does not require a play actor for a manager or a player', () => {
    const query = { [CONTENT_CATALOG_SCOPE_QUERY]: CONTENT_CATALOG_REFERENCE_SCOPE }

    expect(resolveCatalogListFilter({ campaignMembership: membership, query })).toEqual({
      mode: 'reference',
      membership,
    })
    expect(resolveCatalogListFilter({ campaignMembership: playerMembership, query })).toEqual({
      mode: 'reference',
      membership: playerMembership,
    })
  })
})

describe('applyCatalogListFilter reference branch', () => {
  it('keeps an unavailable published row for a player', () => {
    const row = {
      id: 'retired',
      status: 'published' as const,
      campaignAccess: {
        available: false,
        visibilityMode: 'all_players' as const,
        participantIds: [],
        unavailableParticipantIds: [],
        effectiveAudience: 'none' as const,
      },
    }

    expect(
      applyCatalogListFilter([row], { mode: 'reference', membership: playerMembership }),
    ).toEqual([row])
  })
})
