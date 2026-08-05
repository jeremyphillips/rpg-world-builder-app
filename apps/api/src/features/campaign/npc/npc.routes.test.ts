import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../../lib/cookies'
import { CampaignMembershipModel } from '..'
import { createTestCampaign, registerAndLoginTestUser } from '../../../test/auth-agent'
import { minimalNpcRequestInput } from '../../../test/fixtures/npcs'
import { useIntegrationApp } from '../../../test/setup/integration-app'

const getApp = useIntegrationApp()

async function authedOwnerCampaign(email: string) {
  const { agent, csrfToken } = await registerAndLoginTestUser(getApp(), {
    email,
    password: 'supersecret',
    displayName: 'Game Master',
  })
  const campaignId = await createTestCampaign(agent, csrfToken)
  return { agent, csrfToken, campaignId }
}

describe('campaign NPC routes', () => {
  it('creates, lists, reads, and deletes a campaign NPC for owner/co-owner', async () => {
    const { agent, csrfToken, campaignId } = await authedOwnerCampaign('npc-owner@example.com')

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        ...minimalNpcRequestInput,
        connections: { organizations: [{ organizationId: 'organization-1' }], locations: [] },
      })
      .expect(201)

    const npcId = createRes.body.npc.character.id as string
    expect(createRes.body.npc).toMatchObject({
      character: {
        characterType: 'npc',
        name: 'Goblin Scout',
        rulesetId: 'srd-cc-5.2.1',
        connections: { organizations: [{ organizationId: 'organization-1' }], locations: [] },
        vital: { status: 'alive' },
      },
      participation: {
        roster: { status: 'active' },
      },
    })
    expect(createRes.body.npc.character.userId).toBeUndefined()

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(listRes.body.npcs).toHaveLength(1)
    expect(listRes.body.npcs[0]?.character.id).toBe(npcId)

    await agent
      .get(`/api/campaigns/${campaignId}/npcs/${npcId}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    await agent
      .delete(`/api/campaigns/${campaignId}/npcs/${npcId}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(204)

    await agent
      .get(`/api/campaigns/${campaignId}/npcs/${npcId}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(404)
  })

  it('rejects client-supplied campaignId and characterType', async () => {
    const { agent, csrfToken, campaignId } = await authedOwnerCampaign('npc-reject@example.com')

    const res = await agent
      .post(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .send({
        ...minimalNpcRequestInput,
        campaignId: 'other-campaign',
      })
      .expect(400)

    expect(res.body.error.message).toContain('campaignId')
  })

  it('forbids NPC routes for users who are not campaign members', async () => {
    const owner = await authedOwnerCampaign('npc-owner-2@example.com')
    const outsider = await registerAndLoginTestUser(getApp(), {
      email: 'npc-outsider@example.com',
      password: 'supersecret',
      displayName: 'Outsider',
    })

    await owner.agent
      .post(`/api/campaigns/${owner.campaignId}/npcs`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send(minimalNpcRequestInput)
      .expect(201)

    await outsider.agent
      .get(`/api/campaigns/${owner.campaignId}/npcs`)
      .set(CSRF_HEADER, outsider.csrfToken)
      .expect(403)
  })

  it('allows campaign members to list and read NPCs but not mutate them', async () => {
    const owner = await authedOwnerCampaign('npc-owner-3@example.com')
    const member = await registerAndLoginTestUser(getApp(), {
      email: 'npc-member@example.com',
      password: 'supersecret',
      displayName: 'Player',
    })

    const meRes = await member.agent
      .get('/api/auth/me')
      .set(CSRF_HEADER, member.csrfToken)
      .expect(200)

    await CampaignMembershipModel.create({
      campaignId: owner.campaignId,
      userId: meRes.body.user.id as string,
      campaignRole: 'pc',
      controlledCharacterIds: [],
      invitedAt: new Date(),
      joinedAt: new Date(),
    })

    const createRes = await owner.agent
      .post(`/api/campaigns/${owner.campaignId}/npcs`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send(minimalNpcRequestInput)
      .expect(201)

    const npcId = createRes.body.npc.character.id as string

    await member.agent
      .get(`/api/campaigns/${owner.campaignId}/npcs`)
      .set(CSRF_HEADER, member.csrfToken)
      .expect(200)

    await member.agent
      .get(`/api/campaigns/${owner.campaignId}/npcs/${npcId}`)
      .set(CSRF_HEADER, member.csrfToken)
      .expect(200)

    await member.agent
      .post(`/api/campaigns/${owner.campaignId}/npcs`)
      .set(CSRF_HEADER, member.csrfToken)
      .send(minimalNpcRequestInput)
      .expect(403)

    await member.agent
      .delete(`/api/campaigns/${owner.campaignId}/npcs/${npcId}`)
      .set(CSRF_HEADER, member.csrfToken)
      .expect(403)
  })

  it('patches NPC status for owner/co-owner with transition metadata', async () => {
    const { agent, csrfToken, campaignId } = await authedOwnerCampaign('npc-patch@example.com')

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalNpcRequestInput)
      .expect(201)

    const npcId = createRes.body.npc.character.id as string

    const patchRes = await agent
      .patch(`/api/campaigns/${campaignId}/npcs/${npcId}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ roster: { status: 'inactive', note: 'Away from town.' } })
      .expect(200)

    expect(patchRes.body.npc.participation.roster).toMatchObject({
      status: 'inactive',
      note: 'Away from town.',
    })
    expect(patchRes.body.npc.participation.roster.changedAt).toEqual(expect.any(String))

    const noteOnlyRes = await agent
      .patch(`/api/campaigns/${campaignId}/npcs/${npcId}`)
      .set(CSRF_HEADER, csrfToken)
      .send({ roster: { status: 'inactive', note: 'Still away.' } })
      .expect(200)

    expect(noteOnlyRes.body.npc.participation.roster.changedAt).toBe(
      patchRes.body.npc.participation.roster.changedAt,
    )
    expect(noteOnlyRes.body.npc.participation.roster.note).toBe('Still away.')
  })

  it('normalizes legacy NPC documents without vital on read', async () => {
    const { agent, csrfToken, campaignId } = await authedOwnerCampaign('npc-legacy@example.com')

    const createRes = await agent
      .post(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .send(minimalNpcRequestInput)
      .expect(201)

    const npcId = createRes.body.npc.character.id as string

    const { CharacterModel } = await import('../../character')
    await CharacterModel.updateOne({ _id: npcId }, { $unset: { vital: '' } })

    const readRes = await agent
      .get(`/api/campaigns/${campaignId}/npcs/${npcId}`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(readRes.body.npc.character.vital).toEqual({ status: 'alive' })
    expect(readRes.body.npc.participation.roster).toMatchObject({ status: 'active' })
  })
})
