import { describe, expect, it } from 'vitest'
import { Types } from 'mongoose'

import { CSRF_HEADER } from '../../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { registerCampaignMember } from '../../../test/helpers/campaign-membership'
import { seedCharacterParticipation } from '../../../test/helpers/campaign-participation'
import { minimalStandalonePcInput } from '../../../test/fixtures/characters'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationApp } from '../../../test/setup/integration-app'
import { useIntegrationDb } from '../../../test/setup/integration-db'
import { createCampaignNpc } from '../../campaign'
import { CharacterModel, createPcRecord } from '../../character'
import { createHomebrewContent } from '../lib/content-write.service'
import { organizationWriteConfig } from '../organizations/organizations.config'

const getApp = useIntegrationApp()

useIntegrationDb()

const minimalOrganizationInput = {
  slug: 'thieves-guild',
  name: "Thieves' Guild",
  organizationDomain: 'criminal',
} as const

function membershipsPath(campaignId: string, characterId: string, organizationId?: string) {
  const base = `/api/campaigns/${campaignId}/content/characters/${characterId}/organization-memberships`
  return organizationId ? `${base}/${organizationId}` : base
}

function organizationReferencesPath(campaignId: string, characterId: string) {
  return `/api/campaigns/${campaignId}/content/organizations/references/${characterId}`
}

function membersPath(campaignId: string, organizationId: string) {
  return `/api/campaigns/${campaignId}/content/organizations/${organizationId}/members?page=1&pageSize=50`
}

describe('character organization membership nested routes', () => {
  it('mutates memberships, clears title/priority with null, and reflects members roster', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      minimalOrganizationInput,
    )

    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Frug Daergel',
    })

    const createRes = await agent
      .post(membershipsPath(campaignId, npc.id))
      .set(CSRF_HEADER, csrfToken)
      .send({ organizationId: organization.id, title: 'Boss', priority: 50 })
      .expect(201)

    expect(createRes.body.organizationMembership).toEqual({
      organizationId: organization.id,
      title: 'Boss',
      priority: 50,
    })

    const referencesRes = await agent
      .get(organizationReferencesPath(campaignId, npc.id))
      .expect(200)
    expect(referencesRes.body.organizationReferences).toEqual([
      {
        organizationId: organization.id,
        title: 'Boss',
        priority: 50,
        organization: expect.objectContaining({
          id: organization.id,
          name: "Thieves' Guild",
        }),
      },
    ])

    const membersRes = await agent.get(membersPath(campaignId, organization.id)).expect(200)
    expect(membersRes.body.total).toBe(1)
    expect(membersRes.body.items[0]).toEqual(
      expect.objectContaining({
        character: expect.objectContaining({ id: npc.id }),
        membership: { title: 'Boss', priority: 50 },
      }),
    )

    await agent
      .patch(membershipsPath(campaignId, npc.id, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({ title: null, priority: null })
      .expect(200)

    const untitledCharacter = await CharacterModel.findById(npc.id).lean()
    expect(untitledCharacter?.connections?.organizations).toEqual([
      { organizationId: organization.id },
    ])

    await agent
      .delete(membershipsPath(campaignId, npc.id, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    const clearedCharacter = await CharacterModel.findById(npc.id).lean()
    expect(clearedCharacter?.connections?.organizations).toEqual([])

    const membersAfter = await agent.get(membersPath(campaignId, organization.id)).expect(200)
    expect(membersAfter.body.total).toBe(0)
  })

  it('accepts legacy title-only records and round-trips priority on PATCH', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const organization = await createHomebrewContent(organizationWriteConfig, campaignId, {
      ...minimalOrganizationInput,
      slug: 'legacy-guild',
      name: 'Legacy Guild',
      organizationDomain: 'occupational',
      sourcePresetId: 'adventurers_guild',
    })
    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Legacy Member',
    })

    await CharacterModel.collection.updateOne(
      { _id: new Types.ObjectId(npc.id) },
      {
        $set: {
          connections: {
            organizations: [{ organizationId: organization.id, title: 'Guildmaster' }],
          },
        },
      },
    )

    const membersRes = await agent.get(membersPath(campaignId, organization.id)).expect(200)
    expect(membersRes.body.items[0].membership).toEqual({
      title: 'Guildmaster',
      priority: 50,
    })

    await agent
      .patch(membershipsPath(campaignId, npc.id, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({ title: 'Guildmaster', priority: 15 })
      .expect(200)

    const patched = await CharacterModel.findById(npc.id).lean()
    expect(patched?.connections?.organizations).toEqual([
      { organizationId: organization.id, title: 'Guildmaster', priority: 15 },
    ])
  })

  it('rejects omitted PATCH title, duplicates, and missing organizations', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const organization = await createHomebrewContent(
      organizationWriteConfig,
      campaignId,
      minimalOrganizationInput,
    )
    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Validation NPC',
    })

    await agent
      .post(membershipsPath(campaignId, npc.id))
      .set(CSRF_HEADER, csrfToken)
      .send({ organizationId: organization.id })
      .expect(201)

    await agent
      .post(membershipsPath(campaignId, npc.id))
      .set(CSRF_HEADER, csrfToken)
      .send({ organizationId: organization.id })
      .expect(409)

    await agent
      .patch(membershipsPath(campaignId, npc.id, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({})
      .expect(400)

    await agent
      .post(membershipsPath(campaignId, npc.id))
      .set(CSRF_HEADER, csrfToken)
      .send({ organizationId: new Types.ObjectId().toString() })
      .expect(404)
  })

  it('allows PC owner edits and rejects non-editing members', async () => {
    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'org-membership-owner@example.com',
      password: 'supersecret',
      displayName: 'Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Membership Auth')
    const organization = await createHomebrewContent(organizationWriteConfig, campaignId, {
      ...minimalOrganizationInput,
      slug: 'auth-guild',
      name: 'Auth Guild',
    })

    const member = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'org-membership-member@example.com',
      campaignRole: 'pc',
    })

    const pc = await createPcRecord(
      { ...minimalStandalonePcInput, name: 'Owned PC' },
      member.userId,
    )
    await seedCharacterParticipation({ campaignId, characterId: pc.id })

    await member.agent
      .post(membershipsPath(campaignId, pc.id))
      .set(CSRF_HEADER, member.csrfToken)
      .send({ organizationId: organization.id, title: 'Member' })
      .expect(201)

    const outsider = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'org-membership-outsider@example.com',
      campaignRole: 'pc',
    })

    await outsider.agent
      .post(membershipsPath(campaignId, pc.id))
      .set(CSRF_HEADER, outsider.csrfToken)
      .send({ organizationId: organization.id })
      .expect(403)

    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Auth NPC',
    })

    await member.agent
      .post(membershipsPath(campaignId, npc.id))
      .set(CSRF_HEADER, member.csrfToken)
      .send({ organizationId: organization.id })
      .expect(403)

    await owner.agent
      .post(membershipsPath(campaignId, npc.id))
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ organizationId: organization.id })
      .expect(201)
  })

  it('derives next memberships from a fresh document read (no client-array resurrection)', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp())
    const campaignId = await createTestCampaign(agent, csrfToken)
    const first = await createHomebrewContent(organizationWriteConfig, campaignId, {
      ...minimalOrganizationInput,
      slug: 'first-guild',
      name: 'First Guild',
    })
    const second = await createHomebrewContent(organizationWriteConfig, campaignId, {
      ...minimalOrganizationInput,
      slug: 'second-guild',
      name: 'Second Guild',
    })
    const { character: npc } = await createCampaignNpc(campaignId, {
      ...minimalNpcRequestInput,
      name: 'Concurrency NPC',
    })

    await agent
      .post(membershipsPath(campaignId, npc.id))
      .set(CSRF_HEADER, csrfToken)
      .send({ organizationId: first.id })
      .expect(201)

    await agent
      .post(membershipsPath(campaignId, npc.id))
      .set(CSRF_HEADER, csrfToken)
      .send({ organizationId: second.id })
      .expect(201)

    await agent
      .delete(membershipsPath(campaignId, npc.id, first.id))
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    await agent
      .patch(membershipsPath(campaignId, npc.id, second.id))
      .set(CSRF_HEADER, csrfToken)
      .send({ title: 'Captain', priority: 40 })
      .expect(200)

    const character = await CharacterModel.findById(npc.id).lean()
    expect(character?.connections?.organizations).toEqual([
      { organizationId: second.id, title: 'Captain', priority: 40 },
    ])
  })
})
