import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { registerCampaignMember } from '../../../test/helpers/campaign-membership'
import { useIntegrationApp } from '../../../test/setup/integration-app'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createHomebrewContent } from '../lib/content-write.service'
import { locationWriteConfig } from '../locations/locations.config'
import { HomebrewOrganizationModel } from './homebrew-organization.model'
import { organizationWriteConfig } from './organizations.config'

const getApp = useIntegrationApp()

useIntegrationDb()

const minimalOrganizationInput = {
  slug: 'org-loc-conn',
  name: 'Org Loc Conn',
  organizationKind: 'commercial',
} as const

function locationConnectionsPath(
  campaignId: string,
  organizationId: string,
  connectionId?: string,
) {
  const base = `/api/campaigns/${campaignId}/content/organizations/${organizationId}/location-connections`
  return connectionId ? `${base}/${connectionId}` : base
}

function locationReferencesPath(campaignId: string, organizationId: string) {
  return `/api/campaigns/${campaignId}/content/organizations/${organizationId}/location-references`
}

async function seedRegionLocation(campaignId: string) {
  const world = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'org-conn-world',
    kind: 'world',
    name: 'Org Conn World',
  })
  const region = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'org-conn-region',
    kind: 'region',
    name: 'Org Conn Region',
    parentLocationId: world.id,
  })
  return { world, region }
}

async function seedSettlementLocation(campaignId: string, regionId: string) {
  return createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'org-conn-settlement',
    kind: 'settlement',
    name: 'Org Conn Settlement',
    parentLocationId: regionId,
  })
}

describe('organization location connection nested routes', () => {
  it('mutates organization location connections and resolves references', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const { region } = await seedRegionLocation(campaignId)

    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      minimalOrganizationInput,
    )

    const createRes = await agent
      .post(locationConnectionsPath(campaignId, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'org-loc-conn-1',
        locationId: region.id,
        kind: 'governs',
      })
      .expect(201)

    expect(createRes.body.locationConnection).toEqual({
      id: 'org-loc-conn-1',
      locationId: region.id,
      kind: 'governs',
    })

    const referencesRes = await agent
      .get(locationReferencesPath(campaignId, organization.id))
      .expect(200)

    expect(referencesRes.body.locationReferences).toEqual([
      {
        connection: {
          id: 'org-loc-conn-1',
          locationId: region.id,
          kind: 'governs',
        },
        location: expect.objectContaining({
          id: region.id,
          name: 'Org Conn Region',
        }),
      },
    ])

    await agent
      .patch(locationConnectionsPath(campaignId, organization.id, 'org-loc-conn-1'))
      .set(CSRF_HEADER, csrfToken)
      .send({ kind: 'controls' })
      .expect(200)

    const updatedOrganization = await HomebrewOrganizationModel.findById(organization.id).lean()
    expect(updatedOrganization?.connections?.locations).toEqual([
      { id: 'org-loc-conn-1', locationId: region.id, kind: 'controls' },
    ])

    await agent
      .delete(locationConnectionsPath(campaignId, organization.id, 'org-loc-conn-1'))
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const clearedOrganization = await HomebrewOrganizationModel.findById(organization.id).lean()
    expect(clearedOrganization?.connections?.locations).toEqual([])
  })

  it('moves a connection to another location when PATCH changes locationId', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const { region } = await seedRegionLocation(campaignId)
    const settlement = await createHomebrewContent(locationWriteConfig, campaignId, {
      slug: 'org-conn-settlement',
      kind: 'settlement',
      name: 'Org Conn Settlement',
      parentLocationId: region.id,
    })

    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      minimalOrganizationInput,
    )

    await agent
      .post(locationConnectionsPath(campaignId, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'org-loc-move',
        locationId: region.id,
        kind: 'operates_in',
      })
      .expect(201)

    await agent
      .patch(locationConnectionsPath(campaignId, organization.id, 'org-loc-move'))
      .set(CSRF_HEADER, csrfToken)
      .send({ locationId: settlement.id })
      .expect(200)

    const updatedOrganization = await HomebrewOrganizationModel.findById(organization.id).lean()
    expect(updatedOrganization?.connections?.locations).toEqual([
      { id: 'org-loc-move', locationId: settlement.id, kind: 'operates_in' },
    ])
  })

  it('rejects cross-org singleton governs when another organization already governs', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const { region } = await seedRegionLocation(campaignId)

    const firstOrganization = await createHomebrewContent(organizationWriteConfig, campaignId, {
      ...minimalOrganizationInput,
      slug: 'org-governs-first',
      name: 'First Org',
    })
    const secondOrganization = await createHomebrewContent(organizationWriteConfig, campaignId, {
      ...minimalOrganizationInput,
      slug: 'org-governs-second',
      name: 'Second Org',
    })

    await agent
      .post(locationConnectionsPath(campaignId, firstOrganization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'org-loc-governs',
        locationId: region.id,
        kind: 'governs',
      })
      .expect(201)

    await agent
      .post(locationConnectionsPath(campaignId, secondOrganization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'org-loc-governs-dup',
        locationId: region.id,
        kind: 'governs',
      })
      .expect(400)

    await agent
      .post(locationConnectionsPath(campaignId, firstOrganization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'org-loc-controls',
        locationId: region.id,
        kind: 'controls',
      })
      .expect(201)

    await agent
      .patch(locationConnectionsPath(campaignId, firstOrganization.id, 'org-loc-governs'))
      .set(CSRF_HEADER, csrfToken)
      .send({ kind: 'claims' })
      .expect(200)

    const updatedOrganization = await HomebrewOrganizationModel.findById(
      firstOrganization.id,
    ).lean()
    expect(updatedOrganization?.connections?.locations).toEqual([
      { id: 'org-loc-governs', locationId: region.id, kind: 'claims' },
      { id: 'org-loc-controls', locationId: region.id, kind: 'controls' },
    ])
  })

  it('rejects region and settlement headquarters and duplicate location/kind pairs', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const { region } = await seedRegionLocation(campaignId)
    const settlement = await seedSettlementLocation(campaignId, region.id)

    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      minimalOrganizationInput,
    )

    await agent
      .post(locationConnectionsPath(campaignId, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'org-hq-reject-region',
        locationId: region.id,
        kind: 'headquarters',
      })
      .expect(400)

    await agent
      .post(locationConnectionsPath(campaignId, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'org-hq-reject-settlement',
        locationId: settlement.id,
        kind: 'headquarters',
      })
      .expect(400)

    await agent
      .post(locationConnectionsPath(campaignId, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'org-loc-first',
        locationId: region.id,
        kind: 'operates_in',
      })
      .expect(201)

    await agent
      .post(locationConnectionsPath(campaignId, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'org-loc-dup',
        locationId: region.id,
        kind: 'operates_in',
      })
      .expect(400)
  })

  it('requires campaign manager role for mutations', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'org-loc-conn-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Org Loc Conn Auth')
    const { region } = await seedRegionLocation(campaignId)

    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      minimalOrganizationInput,
    )

    const member = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'org-loc-conn-member@example.com',
      campaignRole: 'pc',
    })

    await member.agent
      .post(locationConnectionsPath(campaignId, organization.id))
      .set(CSRF_HEADER, member.csrfToken)
      .send({
        locationId: region.id,
        kind: 'operates_in',
      })
      .expect(403)
  })
})
