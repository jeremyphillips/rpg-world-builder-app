import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../../lib/cookies'
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
      .send(minimalNpcRequestInput)
      .expect(201)

    const npcId = createRes.body.npc.id as string
    expect(createRes.body.npc).toMatchObject({
      characterType: 'npc',
      name: 'Goblin Scout',
      campaignId,
      rulesetId: 'srd-cc-5.2.1',
    })
    expect(createRes.body.npc.userId).toBeUndefined()

    const listRes = await agent
      .get(`/api/campaigns/${campaignId}/npcs`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(listRes.body.npcs).toHaveLength(1)
    expect(listRes.body.npcs[0]?.id).toBe(npcId)

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

  it('forbids NPC routes for non-owner campaign members', async () => {
    const owner = await authedOwnerCampaign('npc-owner-2@example.com')
    const member = await registerAndLoginTestUser(getApp(), {
      email: 'npc-outsider@example.com',
      password: 'supersecret',
      displayName: 'Outsider',
    })

    await owner.agent
      .post(`/api/campaigns/${owner.campaignId}/npcs`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send(minimalNpcRequestInput)
      .expect(201)

    await member.agent
      .get(`/api/campaigns/${owner.campaignId}/npcs`)
      .set(CSRF_HEADER, member.csrfToken)
      .expect(403)
  })
})
