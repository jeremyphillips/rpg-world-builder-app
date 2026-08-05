import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { makeTestCampaign } from '../../../test/fixtures/campaigns'
import { useIntegrationApp } from '../../../test/setup/integration-app'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createHomebrewContent, updateContentEntity } from '../lib/content-write.service'
import { organizationWriteConfig } from '../organizations/organizations.config'
import { resolveOrganizationConnectedRegions } from '../organizations/resolve-organization-connected-regions'
import { locationWriteConfig } from './locations.config'

const getApp = useIntegrationApp()

useIntegrationDb()

const minimalOrganizationInput = {
  slug: 'nested-league',
  name: 'Nested League',
  organizationKind: 'commercial',
} as const

function territorialAuthoritiesPath(
  campaignId: string,
  locationId: string,
  relationshipId?: string,
) {
  const base = `/api/campaigns/${campaignId}/content/locations/${locationId}/territorial-authorities`
  return relationshipId ? `${base}/${relationshipId}` : base
}

describe('territorial authority nested routes', () => {
  it('mutates region authority and updates connected-regions projection', async () => {
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
      .send({ slug: 'nested-world', kind: 'world', name: 'Nested World' })
      .expect(201)
    const worldId = createWorldRes.body.locations.id as string

    const createRegionRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'nested-region',
        kind: 'region',
        name: 'Nested Region',
        parentLocationId: worldId,
      })
      .expect(201)
    const regionId = createRegionRes.body.locations.id as string

    const createRes = await agent
      .post(territorialAuthoritiesPath(campaignId, regionId))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'ta-governs',
        organizationId,
        kind: 'governs',
      })
      .expect(201)

    expect(createRes.body.territorialAuthority).toEqual({
      id: 'ta-governs',
      organizationId,
      kind: 'governs',
    })

    let connected = await resolveOrganizationConnectedRegions({
      campaignId,
      organizationId,
      page: 1,
      pageSize: 10,
    })
    expect(connected?.items).toEqual([
      expect.objectContaining({
        relationshipId: 'ta-governs',
        relationshipKind: 'governs',
      }),
    ])

    await agent
      .patch(territorialAuthoritiesPath(campaignId, regionId, 'ta-governs'))
      .set(CSRF_HEADER, csrfToken)
      .send({ kind: 'claims' })
      .expect(200)

    connected = await resolveOrganizationConnectedRegions({
      campaignId,
      organizationId,
      page: 1,
      pageSize: 10,
    })
    expect(connected?.items).toEqual([
      expect.objectContaining({
        relationshipId: 'ta-governs',
        relationshipKind: 'claims',
        relationshipLabel: 'Claims',
      }),
    ])

    await agent
      .delete(territorialAuthoritiesPath(campaignId, regionId, 'ta-governs'))
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    connected = await resolveOrganizationConnectedRegions({
      campaignId,
      organizationId,
      page: 1,
      pageSize: 10,
    })
    expect(connected?.total).toBe(0)
  })

  it('returns 404 for stale relationship ids', async () => {
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
      .send({ slug: 'stale-world', kind: 'world', name: 'Stale World' })
      .expect(201)
    const worldId = createWorldRes.body.locations.id as string

    const createRegionRes = await agent
      .post(`/api/campaigns/${campaignId}/content/locations`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        slug: 'stale-region',
        kind: 'region',
        name: 'Stale Region',
        parentLocationId: worldId,
      })
      .expect(201)
    const regionId = createRegionRes.body.locations.id as string

    await agent
      .post(territorialAuthoritiesPath(campaignId, regionId))
      .set(CSRF_HEADER, csrfToken)
      .send({ id: 'ta-governs', organizationId, kind: 'governs' })
      .expect(201)

    await agent
      .patch(territorialAuthoritiesPath(campaignId, regionId, 'missing-id'))
      .set(CSRF_HEADER, csrfToken)
      .send({ kind: 'claims' })
      .expect(404)

    await agent
      .delete(territorialAuthoritiesPath(campaignId, regionId, 'missing-id'))
      .set(CSRF_HEADER, csrfToken)
      .expect(404)
  })

  it('shares validation behavior with full location PATCH', async () => {
    const campaign = await makeTestCampaign()
    const world = await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'patch-world',
      kind: 'world',
      name: 'Patch World',
    })
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaign.id,
      minimalOrganizationInput,
    )
    const region = await createHomebrewContent(locationWriteConfig, campaign.id, {
      slug: 'patch-region',
      kind: 'region',
      name: 'Patch Region',
      parentLocationId: world.id,
      territorialAuthority: [],
    })

    await expect(
      updateContentEntity(locationWriteConfig, campaign.id, region.id, {
        kind: 'region',
        territorialAuthority: [
          { id: 'ta-dup', organizationId: organization.id, kind: 'governs' },
          { id: 'ta-dup', organizationId: organization.id, kind: 'claims' },
        ],
      }),
    ).rejects.toThrow(/Territorial authority ids must be unique/)

    const updated = await updateContentEntity(locationWriteConfig, campaign.id, region.id, {
      kind: 'region',
      territorialAuthority: [
        { id: 'ta-governs', organizationId: organization.id, kind: 'governs' },
      ],
    })

    if (updated.kind !== 'region') throw new Error('expected region')
    expect(updated.territorialAuthority).toEqual([
      { id: 'ta-governs', organizationId: organization.id, kind: 'governs' },
    ])
  })

  it('rejects territorial authority mutation on non-region locations', async () => {
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
      .send({ slug: 'world-only', kind: 'world', name: 'World Only' })
      .expect(201)
    const worldId = createWorldRes.body.locations.id as string

    await agent
      .post(territorialAuthoritiesPath(campaignId, worldId))
      .set(CSRF_HEADER, csrfToken)
      .send({ id: 'ta-governs', organizationId, kind: 'governs' })
      .expect(400)
  })
})
