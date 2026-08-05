import { describe, expect, it } from 'vitest'
import request from 'supertest'

import { getCrossContentRelationshipProjection } from '@rpg/contracts'
import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationApp } from '../../../test/setup/integration-app'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createHomebrewContent } from '../lib/content-write.service'
import { organizationWriteConfig } from './organizations.config'
import { resolveOrganizationConnectedRegions } from './resolve-organization-connected-regions'
import { locationWriteConfig } from '../locations/locations.config'

const getApp = useIntegrationApp()

useIntegrationDb()

const minimalOrganizationInput = {
  slug: 'coastal-league',
  name: 'Coastal League',
  organizationKind: 'commercial',
} as const

const connectedRegionsPath = (campaignId: string, organizationId: string) =>
  `/api/campaigns/${campaignId}/content/organizations/${organizationId}/connected-regions?page=1&pageSize=4`

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
          relationshipId: 'ta-governs',
          relationshipFamily: 'territorialAuthority',
          relationshipKind: 'governs',
          relationshipLabel: 'Governs',
        }),
        expect.objectContaining({
          relationshipId: 'assoc-hq',
          relationshipFamily: 'partyAssociation',
          relationshipKind: 'headquarters',
          relationshipLabel: 'Headquarters',
        }),
      ]),
    )
  })

  it('registers subject-owned location connection projections', () => {
    const character = getCrossContentRelationshipProjection('character_location_connection')
    const organization = getCrossContentRelationshipProjection('organization_location_connection')

    expect(character).toMatchObject({
      ownerContentType: 'characters',
      targetContentType: 'locations',
      ownerField: 'connections.locations',
      capabilities: { forward: 'write', inverse: 'write' },
    })
    expect(organization).toMatchObject({
      ownerContentType: 'organizations',
      targetContentType: 'locations',
      ownerField: 'connections.locations',
      capabilities: { forward: 'write', inverse: 'write' },
    })
  })
})

describe('organization connected regions routes', () => {
  it('requires authentication', async () => {
    await request(getApp())
      .get(
        '/api/campaigns/000000000000000000000000/content/organizations/000000000000000000000001/connected-regions',
      )
      .expect(401)
  })

  it('returns connected regions for authenticated campaign users', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const createOrgRes = await agent
      .post(`/api/campaigns/${campaignId}/content/organizations`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalOrganizationInput)
      .expect(201)

    const organizationId = createOrgRes.body.organizations.id as string

    const createWorldRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'route-world',
        kind: 'world',
        name: 'Route World',
      })
      .expect(201)

    const worldId = createWorldRes.body.locations.id as string

    await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'route-region',
        kind: 'region',
        name: 'Route Region',
        parentLocationId: worldId,
        territorialAuthority: [
          {
            id: 'ta-governs',
            organizationId,
            kind: 'governs',
          },
        ],
      })
      .expect(201)

    const res = await agent
      .get(connectedRegionsPath(campaignId, organizationId))
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(res.body).toEqual({
      items: [
        expect.objectContaining({
          relationshipId: 'ta-governs',
          relationshipFamily: 'territorialAuthority',
          relationshipKind: 'governs',
          relationshipLabel: 'Governs',
          region: expect.objectContaining({ name: 'Route Region' }),
        }),
      ],
      total: 1,
    })
  })

  it('returns 404 for a missing organization in the campaign', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    await agent
      .get(connectedRegionsPath(campaignId, '000000000000000000000000'))
      .set(CSRF_HEADER, csrfToken)
      .expect(404)
  })
})
