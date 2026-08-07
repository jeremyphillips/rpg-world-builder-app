import { describe, expect, it } from 'vitest'
import { Types } from 'mongoose'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { registerCampaignMember } from '../../../test/helpers/campaign-membership'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationApp } from '../../../test/setup/integration-app'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createCampaignNpc } from '../../campaign'
import { CharacterModel } from '../../character'
import { createHomebrewContent } from '../lib/content-write.service'
import { locationWriteConfig } from '../locations/locations.config'

const getApp = useIntegrationApp()

useIntegrationDb()

function locationConnectionsPath(campaignId: string, characterId: string, connectionId?: string) {
  const base = `/api/campaigns/${campaignId}/content/characters/${characterId}/location-connections`
  return connectionId ? `${base}/${connectionId}` : base
}

function locationReferencesPath(campaignId: string, characterId: string) {
  return `/api/campaigns/${campaignId}/content/locations/references/${characterId}`
}

async function seedBuildingLocation(campaignId: string) {
  const world = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'conn-world',
    kind: 'world',
    name: 'Connection World',
  })
  const region = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'conn-region',
    kind: 'region',
    name: 'Connection Region',
    parentLocationId: world.id,
  })
  const settlement = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'conn-settlement',
    kind: 'settlement',
    name: 'Connection Settlement',
    settlementType: 'city',
    parentLocationId: region.id,
  })
  const district = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'conn-district',
    kind: 'district',
    name: 'Connection District',
    parentLocationId: settlement.id,
  })
  const building = await createHomebrewContent(locationWriteConfig, campaignId, {
    slug: 'conn-tavern',
    kind: 'structure',
    structureType: 'building',
    name: 'Connection Tavern',
    parentLocationId: district.id,
  })

  return { world, settlement, building }
}

describe('character location connection nested routes', () => {
  it('mutates character location connections and resolves references', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const { building } = await seedBuildingLocation(campaignId)

    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Tavern Regular',
    })

    const createRes = await agent
      .post(locationConnectionsPath(campaignId, npc.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'loc-conn-1',
        locationId: building.id,
        kind: 'works_at',
      })
      .expect(201)

    expect(createRes.body.locationConnection).toEqual({
      id: 'loc-conn-1',
      locationId: building.id,
      kind: 'works_at',
    })

    const referencesRes = await agent.get(locationReferencesPath(campaignId, npc.id)).expect(200)
    expect(referencesRes.body.locationReferences).toEqual([
      {
        connection: {
          id: 'loc-conn-1',
          locationId: building.id,
          kind: 'works_at',
        },
        location: expect.objectContaining({
          id: building.id,
          name: 'Connection Tavern',
        }),
      },
    ])

    await agent
      .patch(locationConnectionsPath(campaignId, npc.id, 'loc-conn-1'))
      .set(CSRF_HEADER, csrfToken)
      .send({ kind: 'resides_at' })
      .expect(200)

    const updatedCharacter = await CharacterModel.findById(npc.id).lean()
    expect(updatedCharacter?.connections?.locations).toEqual([
      { id: 'loc-conn-1', locationId: building.id, kind: 'resides_at' },
    ])

    await agent
      .delete(locationConnectionsPath(campaignId, npc.id, 'loc-conn-1'))
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const clearedCharacter = await CharacterModel.findById(npc.id).lean()
    expect(clearedCharacter?.connections?.locations).toEqual([])
  })

  it('rejects ineligible kinds and duplicate location/kind pairs', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const { settlement } = await seedBuildingLocation(campaignId)

    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Settlement Resident',
    })

    await agent
      .post(locationConnectionsPath(campaignId, npc.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'loc-conn-ineligible',
        locationId: settlement.id,
        kind: 'owns',
      })
      .expect(400)

    await agent
      .post(locationConnectionsPath(campaignId, npc.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'loc-conn-first',
        locationId: settlement.id,
        kind: 'resides_at',
      })
      .expect(201)

    await agent
      .post(locationConnectionsPath(campaignId, npc.id))
      .set(CSRF_HEADER, csrfToken)
      .send({
        id: 'loc-conn-dup',
        locationId: settlement.id,
        kind: 'resides_at',
      })
      .expect(400)
  })

  it('requires campaign manager role for mutations', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'loc-conn-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Loc Conn Auth')
    const { building } = await seedBuildingLocation(campaignId)

    const member = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'loc-conn-member@example.com',
      campaignRole: 'pc',
    })

    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Auth NPC',
    })

    await member.agent
      .post(locationConnectionsPath(campaignId, npc.id))
      .set(CSRF_HEADER, member.csrfToken)
      .send({
        locationId: building.id,
        kind: 'works_at',
      })
      .expect(403)
  })
})

describe('GET /api/campaigns/:campaignId/content/locations/references/:characterId', () => {
  it('returns location references for a participating campaign NPC', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'loc-ref-npc-owner@example.com',
      password: 'supersecret',
      displayName: 'Campaign Owner',
    })
    const campaignId = await createTestCampaign(
      owner.agent,
      owner.csrfToken,
      'Loc Ref NPC Campaign',
    )
    const { building } = await seedBuildingLocation(campaignId)
    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Hideout Resident',
    })

    await CharacterModel.collection.updateOne(
      { _id: new Types.ObjectId(npc.id) },
      {
        $set: {
          connections: {
            organizations: [],
            locations: [{ id: 'hideout-conn', locationId: building.id, kind: 'resides_at' }],
          },
        },
      },
    )

    const response = await owner.agent.get(locationReferencesPath(campaignId, npc.id)).expect(200)

    expect(response.body.locationReferences).toEqual([
      {
        connection: {
          id: 'hideout-conn',
          locationId: building.id,
          kind: 'resides_at',
        },
        location: expect.objectContaining({
          id: building.id,
          name: 'Connection Tavern',
        }),
      },
    ])
  })
})
