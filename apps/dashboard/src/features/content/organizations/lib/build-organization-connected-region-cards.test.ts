import { describe, expect, it } from 'vitest'

import type { OrganizationConnectedRegionsResponse } from '@rpg/contracts'

import { buildOrganizationConnectedRegionCards } from './build-organization-connected-region-cards'

describe('buildOrganizationConnectedRegionCards', () => {
  it('maps relationship ids and region detail links from connected-regions rows', () => {
    const connectedRegions: OrganizationConnectedRegionsResponse = {
      total: 2,
      items: [
        {
          relationshipId: 'ta-governs',
          relationshipFamily: 'territorialAuthority',
          relationshipKind: 'governs',
          relationshipLabel: 'Governs',
          region: { id: 'region-1', name: 'Grey Coast', slug: 'grey-coast' },
        },
        {
          relationshipId: 'assoc-hq',
          relationshipFamily: 'partyAssociation',
          relationshipKind: 'headquarters',
          relationshipLabel: 'Headquarters',
          region: { id: 'region-2', name: 'Sunset Vale', slug: 'sunset-vale' },
        },
      ],
    }

    expect(
      buildOrganizationConnectedRegionCards(connectedRegions, { campaignId: 'camp-1' }),
    ).toEqual({
      total: 2,
      previewItems: [
        {
          relationshipId: 'ta-governs',
          card: {
            id: 'region-1',
            name: 'Grey Coast',
            summary: 'Territorial authority · Governs',
          },
          detailHref: '/campaigns/camp-1/locations/region-1',
        },
        {
          relationshipId: 'assoc-hq',
          card: {
            id: 'region-2',
            name: 'Sunset Vale',
            summary: 'People & organizations · Headquarters',
          },
          detailHref: '/campaigns/camp-1/locations/region-2',
        },
      ],
    })
  })
})
