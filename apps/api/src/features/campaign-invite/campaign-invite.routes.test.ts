import request, { type Agent } from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { registerAndLoginTestUser } from '../../test/auth-agent'
import { createTestCampaign } from '../../test/auth-agent'
import { minimalStandalonePcInput } from '../../test/fixtures/characters'
import { useIntegrationApp } from '../../test/setup/integration-app'
import {
  createFakeEmailProvider,
  getFakeEmailSentMessages,
  resetFakeEmailSentMessages,
} from '../../services/email/providers/fake-email.provider'
import { setEmailProviderForTests } from '../../services/email/email.service'
import { generateInviteToken, hashInviteToken } from './campaign-invite-token'
import { computeInviteExpiresAt } from './campaign-invite.lib'
import { createInviteRecord } from './campaign-invite.repository'

const getApp = useIntegrationApp()
const TEST_PASSWORD = 'supersecret'

afterEach(() => {
  setEmailProviderForTests(undefined)
  resetFakeEmailSentMessages()
})

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

function extractInviteTokenFromEmail(text: string): string {
  const match = text.match(/\/campaign-invites\/([0-9a-f]{64})/)
  if (!match?.[1]) {
    throw new Error('Invite token not found in email body.')
  }
  return match[1]
}

describe('campaign invite routes', () => {
  it('requires authentication to send invites', async () => {
    await request(getApp())
      .post('/api/campaigns/000000000000000000000000/invites')
      .send({ email: 'player@example.com' })
      .expect(403)
  })

  it('requires owner/co-owner role to send invites', async () => {
    const { agent, csrfToken } = await registerOwner('invite-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'Invite Route Campaign')

    const player = await registerAndLoginTestUser(getApp(), {
      email: 'invite-player@example.com',
      password: TEST_PASSWORD,
      displayName: 'Player',
    })

    const response = await player.agent
      .post(`/api/campaigns/${campaignId}/invites`)
      .set(CSRF_HEADER, player.csrfToken)
      .send({ email: 'another@example.com' })
      .expect(403)

    expect(response.body.error).toMatchObject({ code: 'forbidden' })
  })

  it('sends an invite and lists pending invites for owners', async () => {
    const { agent, csrfToken } = await registerOwner('invite-send@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'Send Invite Campaign')

    const sendResponse = await agent
      .post(`/api/campaigns/${campaignId}/invites`)
      .set(CSRF_HEADER, csrfToken)
      .send({ email: 'player@example.com' })
      .expect(201)

    expect(sendResponse.body.invite).toMatchObject({
      email: 'player@example.com',
      status: 'pending',
    })

    const listResponse = await agent.get(`/api/campaigns/${campaignId}/invites`).expect(200)
    expect(listResponse.body.invites).toHaveLength(1)
  })

  it('resolves invites without authentication', async () => {
    const { agent, csrfToken } = await registerOwner('invite-public@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'Public Resolve Campaign')
    const rawToken = generateInviteToken()

    await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: 'owner-id',
    })

    const response = await request(getApp()).get(`/api/campaign-invites/${rawToken}`).expect(200)

    expect(response.body.resolution).toMatchObject({
      campaignName: 'Public Resolve Campaign',
      status: 'pending',
    })
  })

  it('accepts invites for the matching authenticated user', async () => {
    const { agent, csrfToken } = await registerOwner('invite-accept-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'Accept Campaign')
    const rawToken = generateInviteToken()

    const ownerSession = await agent.get('/api/auth/me')
    const ownerId = ownerSession.body.user.id as string

    await createInviteRecord({
      campaignId,
      email: 'invite-accept-player@example.com',
      normalizedEmail: 'invite-accept-player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: ownerId,
    })

    const player = await registerAndLoginTestUser(getApp(), {
      email: 'invite-accept-player@example.com',
      password: TEST_PASSWORD,
      displayName: 'Invite Player',
    })

    const acceptResponse = await player.agent
      .post(`/api/campaign-invites/${rawToken}/accept`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    expect(acceptResponse.body).toMatchObject({ campaignId })

    const contextResponse = await player.agent
      .get(`/api/campaign-invites/${acceptResponse.body.inviteId}/onboarding-context`)
      .expect(200)

    expect(contextResponse.body.context).toMatchObject({
      status: 'accepted',
      campaign: { id: campaignId, name: 'Accept Campaign' },
      membership: { role: 'pc' },
    })
  })

  it('lists eligible characters for an accepted invite', async () => {
    const { agent, csrfToken } = await registerOwner('invite-eligible-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'Eligible Characters Campaign')
    const rawToken = generateInviteToken()

    const ownerSession = await agent.get('/api/auth/me')
    const ownerId = ownerSession.body.user.id as string

    await createInviteRecord({
      campaignId,
      email: 'invite-eligible-player@example.com',
      normalizedEmail: 'invite-eligible-player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: ownerId,
    })

    const player = await registerAndLoginTestUser(getApp(), {
      email: 'invite-eligible-player@example.com',
      password: TEST_PASSWORD,
      displayName: 'Eligible Player',
    })

    const acceptResponse = await player.agent
      .post(`/api/campaign-invites/${rawToken}/accept`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    const eligibleResponse = await player.agent
      .get(`/api/campaign-invites/${acceptResponse.body.inviteId}/eligible-characters`)
      .expect(200)

    expect(Array.isArray(eligibleResponse.body.characters)).toBe(true)
  })

  it('completes invite onboarding end-to-end from send through existing character', async () => {
    setEmailProviderForTests(createFakeEmailProvider())
    const { agent, csrfToken } = await registerOwner('invite-e2e-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'E2E Invite Campaign')

    await agent
      .post(`/api/campaigns/${campaignId}/invites`)
      .set(CSRF_HEADER, csrfToken)
      .send({ email: 'invite-e2e-player@example.com' })
      .expect(201)

    const rawToken = extractInviteTokenFromEmail(getFakeEmailSentMessages()[0]?.text ?? '')

    const player = await registerAndLoginTestUser(getApp(), {
      email: 'invite-e2e-player@example.com',
      password: TEST_PASSWORD,
      displayName: 'E2E Player',
    })
    const characterId = await createCharacter(player.agent, player.csrfToken)

    const acceptResponse = await player.agent
      .post(`/api/campaign-invites/${rawToken}/accept`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    const inviteId = acceptResponse.body.inviteId as string

    const completeResponse = await player.agent
      .post(`/api/campaign-invites/${inviteId}/complete-with-existing-character`)
      .set(CSRF_HEADER, player.csrfToken)
      .send({ characterId })
      .expect(200)

    expect(completeResponse.body).toMatchObject({ campaignId, characterId })

    const contextResponse = await player.agent
      .get(`/api/campaign-invites/${inviteId}/onboarding-context`)
      .expect(200)

    expect(contextResponse.body.context).toMatchObject({
      status: 'completed',
      campaignId,
      characterId,
    })
  })
})
