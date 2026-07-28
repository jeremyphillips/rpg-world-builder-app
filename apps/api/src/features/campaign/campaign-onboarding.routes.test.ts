import request, { type Agent } from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { useIntegrationApp } from '../../test/setup/integration-app'
import {
  computeInviteExpiresAt,
  createInviteRecord,
  generateInviteToken,
  hashInviteToken,
} from '../campaign-invite'

const getApp = useIntegrationApp()
const TEST_PASSWORD = 'supersecret'

async function registerOwner(email: string) {
  return registerAndLoginTestUser(getApp(), {
    email,
    password: TEST_PASSWORD,
    displayName: 'Campaign Owner',
  })
}

async function createCharacter(agent: Agent, csrfToken: string): Promise<string> {
  const response = await agent
    .post('/api/characters')
    .set(CSRF_HEADER, csrfToken)
    .send(minimalStandalonePcInput)
    .expect(201)

  return response.body.character.id as string
}

async function acceptInviteForPlayer({
  campaignId,
  ownerId,
  playerEmail,
}: {
  campaignId: string
  ownerId: string
  playerEmail: string
}) {
  const rawToken = generateInviteToken()
  await createInviteRecord({
    campaignId,
    email: playerEmail,
    normalizedEmail: playerEmail,
    tokenHash: hashInviteToken(rawToken),
    expiresAt: computeInviteExpiresAt(),
    invitedByUserId: ownerId,
  })

  const player = await registerAndLoginTestUser(getApp(), {
    email: playerEmail,
    password: TEST_PASSWORD,
    displayName: 'Onboarding Player',
  })

  await player.agent
    .post(`/api/campaign-invites/${rawToken}/accept`)
    .set(CSRF_HEADER, player.csrfToken)
    .expect(200)

  return player
}

describe('campaign onboarding routes', () => {
  it('requires authentication for onboarding context', async () => {
    await request(getApp())
      .get('/api/campaigns/000000000000000000000000/onboarding-context')
      .expect(401)
  })

  it('returns onboarding context for an incomplete pc member', async () => {
    const { agent, csrfToken } = await registerOwner('onboarding-context-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'Onboarding Context Campaign')
    const ownerSession = await agent.get('/api/auth/me')
    const ownerId = ownerSession.body.user.id as string

    const player = await acceptInviteForPlayer({
      campaignId,
      ownerId,
      playerEmail: 'onboarding-context-player@example.com',
    })

    const response = await player.agent
      .get(`/api/campaigns/${campaignId}/onboarding-context`)
      .expect(200)

    expect(response.body.context).toMatchObject({
      status: 'onboarding_incomplete',
      campaignId,
      campaign: { id: campaignId, name: 'Onboarding Context Campaign' },
    })
    expect(response.body.context).not.toHaveProperty('inviteId')
    expect(response.body.context).not.toHaveProperty('membershipId')
  })

  it('lists eligible characters for incomplete onboarding', async () => {
    const { agent, csrfToken } = await registerOwner('onboarding-eligible-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'Onboarding Eligible Campaign')
    const ownerSession = await agent.get('/api/auth/me')
    const ownerId = ownerSession.body.user.id as string

    const player = await acceptInviteForPlayer({
      campaignId,
      ownerId,
      playerEmail: 'onboarding-eligible-player@example.com',
    })

    const response = await player.agent
      .get(`/api/campaigns/${campaignId}/onboarding/eligible-characters`)
      .expect(200)

    expect(Array.isArray(response.body.characters)).toBe(true)
  })

  it('completes membership-scoped onboarding end-to-end with an existing character', async () => {
    const { agent, csrfToken } = await registerOwner('onboarding-complete-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'Onboarding Complete Campaign')
    const ownerSession = await agent.get('/api/auth/me')
    const ownerId = ownerSession.body.user.id as string

    const player = await acceptInviteForPlayer({
      campaignId,
      ownerId,
      playerEmail: 'onboarding-complete-player@example.com',
    })
    const characterId = await createCharacter(player.agent, player.csrfToken)

    const completeResponse = await player.agent
      .post(`/api/campaigns/${campaignId}/onboarding/complete`)
      .set(CSRF_HEADER, player.csrfToken)
      .send({ source: 'existing', characterId })
      .expect(200)

    expect(completeResponse.body).toMatchObject({ campaignId, characterId })

    const contextResponse = await player.agent
      .get(`/api/campaigns/${campaignId}/onboarding-context`)
      .expect(200)

    expect(contextResponse.body.context).toMatchObject({
      status: 'complete',
      campaignId,
      characterId,
    })
  })

  it('forbids onboarding context for non-members', async () => {
    const { agent, csrfToken } = await registerOwner('onboarding-forbidden-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'Forbidden Onboarding Campaign')

    const outsider = await registerAndLoginTestUser(getApp(), {
      email: 'onboarding-outsider@example.com',
      password: TEST_PASSWORD,
      displayName: 'Outsider',
    })

    const response = await outsider.agent
      .get(`/api/campaigns/${campaignId}/onboarding-context`)
      .expect(404)

    expect(response.body.error).toMatchObject({ code: 'not_found' })
  })
})
