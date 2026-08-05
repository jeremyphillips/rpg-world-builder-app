import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createHomebrewContent } from '../lib/content-write.service'
import { organizationWriteConfig } from './organizations.config'
import { resolveOrganizationConnectedRegions } from './resolve-organization-connected-regions'
import { locationWriteConfig } from '../locations/locations.config'

useIntegrationDb()

const minimalOrganizationInput = {
  slug: 'coastal-league',
  name: 'Coastal League',
  organizationKind: 'commercial',
} as const

describe('resolveOrganizationConnectedRegions', () => {
  it('returns family-labeled territorial and party rows separately', async () => {
    const campaign = await makeTestCampaign()
    const world = await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'connected-world',
      kind: 'world',
      name: 'Connected World',
    })
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      minimalOrganizationInput,
    )
    await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'linked-region',
      kind: 'region',
      name: 'Linked Region',
      parentLocationId: world.id,
      territorialAuthority: [
        {
          id: 'ta-governs',
          organizationId: organization.id,
          kind: 'governs',
        },
      ],
      partyAssociations: [
        {
          id: 'assoc-hq',
          kind: 'occupancy',
          role: 'headquarters',
          party: { kind: 'organization', organizationId: organization.id },
        },
      ],
    })

    const result = await resolveOrganizationConnectedRegions({
      campaignId: campaign.id,
      organizationId: organization.id,
      page: 1,
      pageSize: 10,
    })

    expect(result?.total).toBe(2)
    expect(result?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          relationshipFamily: 'territorialAuthority',
          relationshipKind: 'governs',
          relationshipLabel: 'Governs',
        }),
        expect.objectContaining({
          relationshipFamily: 'partyAssociation',
          relationshipKind: 'headquarters',
          relationshipLabel: 'Headquarters',
        }),
      ]),
    )
  })
})
