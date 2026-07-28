import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { registerAndLoginTestUser } from '../../test/auth-agent'
import { createTestCampaign } from '../../test/auth-agent'
import { useIntegrationApp } from '../../test/setup/integration-app'
import { setEmailProviderForTests } from '../../services/email/email.service'
import { generateInviteToken, hashInviteToken } from './campaign-invite-token'
import { computeInviteExpiresAt } from './campaign-invite.lib'
import { createInviteRecord } from './campaign-invite.repository'

const getApp = useIntegrationApp()
const TEST_PASSWORD = 'supersecret'

afterEach(() => {
  setEmailProviderForTests(undefined)
})

async function registerOwner(email: string) {
  return registerAndLoginTestUser(getApp(), {
    email,
    password: TEST_PASSWORD,
    displayName: 'Campaign Owner',
  })
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
  })
})
