import { describe, expect, it } from 'vitest'
import { Types } from 'mongoose'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationApp } from '../../../test/setup/integration-app'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createCampaignNpc } from '../../campaign'
import { CharacterModel } from '../../character'
import { createHomebrewContent } from '../lib/content-write.service'
import { locationWriteConfig } from './locations.config'
import { organizationWriteConfig } from '../organizations/organizations.config'
import { HomebrewOrganizationModel } from '../organizations/homebrew-organization.model'
import { resolveLocationConnectedParties } from './resolve-location-connected-parties'

const getApp = useIntegrationApp()

useIntegrationDb()

const connectedPartiesPath = (campaignId: string, locationId: string) =>
  `/api/campaigns/${campaignId}/content/locations/${locationId}/connected-parties`

describe('resolveLocationConnectedParties', () => {
  it('merges character and organization rows with deterministic ordering', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const world = await createHomebrewContent(locationWriteConfig, campaignId, {
      slug: 'cp-world',
      kind: 'world',
      name: 'CP World',
    })
    const region = await createHomebrewContent(locationWriteConfig, campaignId, {
      slug: 'cp-region',
      kind: 'region',
      name: 'CP Region',
      parentLocationId: world.id,
    })

    const organization = await createHomebrewContent(organizationWriteConfig, campaignId, {
      slug: 'cp-org',
      name: 'Alpha Org',
      organizationKind: 'commercial',
    })

    await HomebrewOrganizationModel.collection.updateOne(
      { _id: new Types.ObjectId(organization.id) },
      {
        $set: {
          connections: {
            locations: [{ id: 'org-ta-1', locationId: region.id, kind: 'governs' }],
          },
        },
      },
    )

    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Beta NPC',
    })

    await CharacterModel.collection.updateOne(
      { _id: new Types.ObjectId(npc.id) },
      {
        $set: {
          connections: {
            organizations: [],
            locations: [{ id: 'char-loc-1', locationId: region.id, kind: 'works_at' }],
          },
        },
      },
    )

    const result = await resolveLocationConnectedParties({
      campaignId,
      locationId: region.id,
      page: 1,
      pageSize: 10,
    })

    expect(result?.total).toBe(2)
    expect(result?.items).toEqual([
      expect.objectContaining({
        relationshipId: 'org-ta-1',
        sectionGroup: 'territorial_authority',
        subject: expect.objectContaining({ type: 'organization', name: 'Alpha Org' }),
        label: 'Governs',
      }),
      expect.objectContaining({
        relationshipId: 'char-loc-1',
        sectionGroup: 'people_and_organizations',
        subject: expect.objectContaining({ type: 'character', name: 'Beta NPC' }),
        label: 'Works here',
      }),
    ])
  })
})

describe('location connected parties routes', () => {
  it('returns connected parties for authenticated campaign users', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)

    const world = await createHomebrewContent(locationWriteConfig, campaignId, {
      slug: 'route-cp-world',
      kind: 'world',
      name: 'Route CP World',
    })
    const region = await createHomebrewContent(locationWriteConfig, campaignId, {
      slug: 'route-cp-region',
      kind: 'region',
      name: 'Route CP Region',
      parentLocationId: world.id,
    })

    const organization = await createHomebrewContent(organizationWriteConfig, campaignId, {
      slug: 'route-cp-org',
      name: 'Route CP Org',
      organizationKind: 'commercial',
    })

    await agent
      .post(
        `/api/campaigns/${campaignId}/content/organizations/${organization.id}/location-connections`,
      )
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'route-org-conn',
        locationId: region.id,
        kind: 'claims',
      })
      .expect(201)

    const res = await agent.get(connectedPartiesPath(campaignId, region.id)).expect(200)

    expect(res.body).toEqual({
      items: [
        expect.objectContaining({
          relationshipId: 'route-org-conn',
          sectionGroup: 'territorial_authority',
          label: 'Claims',
          subject: expect.objectContaining({
            type: 'organization',
            name: 'Route CP Org',
          }),
        }),
      ],
      total: 1,
    })
  })
})
