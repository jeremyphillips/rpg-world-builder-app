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
  organizationKind: 'criminal',
} as const

function membershipsPath(campaignId: string, characterId: string, organizationId?: string) {
  const base = `/api/campaigns/${campaignId}/content/characters/${characterId}/organization-memberships`
  return organizationId ? `${base}/${organizationId}` : base
}

function organizationReferencesPath(campaignId: string, characterId: string) {
  return `/api/campaigns/${campaignId}/content/organizations/references/${characterId}`
}

function connectedCharactersPath(campaignId: string, organizationId: string) {
  return `/api/campaigns/${campaignId}/content/organizations/${organizationId}/connected-characters?page=1&pageSize=4`
}

describe('character organization membership nested routes', () => {
  it('mutates memberships, clears title with null, and reflects connected characters', async () => {
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
      .send({ organizationId: organization.id, title: 'Boss' })
      .expect(201)

    expect(createRes.body.organizationMembership).toEqual({
      organizationId: organization.id,
      title: 'Boss',
    })

    const referencesRes = await agent
      .get(organizationReferencesPath(campaignId, npc.id))
      .expect(200)
    expect(referencesRes.body.organizationReferences).toEqual([
      {
        organizationId: organization.id,
        title: 'Boss',
        organization: expect.objectContaining({
          id: organization.id,
          name: "Thieves' Guild",
        }),
      },
    ])

    const connectedRes = await agent
      .get(connectedCharactersPath(campaignId, organization.id))
      .expect(200)
    expect(connectedRes.body.total).toBe(1)

    await agent
      .patch(membershipsPath(campaignId, npc.id, organization.id))
      .set(CSRF_HEADER, csrfToken)
      .send({ title: null })
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

    const connectedAfter = await agent
      .get(connectedCharactersPath(campaignId, organization.id))
      .expect(200)
    expect(connectedAfter.body.total).toBe(0)
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
      .send({ title: 'Captain' })
      .expect(200)

    const character = await CharacterModel.findById(npc.id).lean()
    expect(character?.connections?.organizations).toEqual([
      { organizationId: second.id, title: 'Captain' },
    ])
  })
})
