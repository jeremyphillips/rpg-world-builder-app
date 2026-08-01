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

  it('resolves invites by id for the matching authenticated user', async () => {
    const { agent, csrfToken } = await registerOwner('invite-by-id-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'By Id Resolve Campaign')
    const rawToken = generateInviteToken()

    const ownerSession = await agent.get('/api/auth/me')
    const ownerId = ownerSession.body.user.id as string

    const invite = await createInviteRecord({
      campaignId,
      email: 'invite-by-id-player@example.com',
      normalizedEmail: 'invite-by-id-player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: ownerId,
    })

    const player = await registerAndLoginTestUser(getApp(), {
      email: 'invite-by-id-player@example.com',
      password: TEST_PASSWORD,
      displayName: 'Invite Player',
    })

    const response = await player.agent.get(`/api/campaign-invites/by-id/${invite.id}`).expect(200)

    expect(response.body.resolution).toMatchObject({
      inviteId: invite.id,
      campaignId,
      campaignName: 'By Id Resolve Campaign',
      status: 'pending',
    })
  })

  it('returns 404 for by-id resolve when the session email does not match', async () => {
    const { agent, csrfToken } = await registerOwner('invite-by-id-mismatch@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'By Id Mismatch Campaign')
    const rawToken = generateInviteToken()

    const ownerSession = await agent.get('/api/auth/me')
    const ownerId = ownerSession.body.user.id as string

    const invite = await createInviteRecord({
      campaignId,
      email: 'invite-by-id-target@example.com',
      normalizedEmail: 'invite-by-id-target@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: ownerId,
    })

    const otherUser = await registerAndLoginTestUser(getApp(), {
      email: 'other-by-id-user@example.com',
      password: TEST_PASSWORD,
      displayName: 'Other User',
    })

    const response = await otherUser.agent
      .get(`/api/campaign-invites/by-id/${invite.id}`)
      .expect(404)

    expect(response.body.error).toMatchObject({ code: 'not_found' })
  })

  it('accepts invites by id for the matching authenticated user', async () => {
    const { agent, csrfToken } = await registerOwner('invite-by-id-accept-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'By Id Accept Campaign')
    const rawToken = generateInviteToken()

    const ownerSession = await agent.get('/api/auth/me')
    const ownerId = ownerSession.body.user.id as string

    const invite = await createInviteRecord({
      campaignId,
      email: 'invite-by-id-accept-player@example.com',
      normalizedEmail: 'invite-by-id-accept-player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: ownerId,
    })

    const player = await registerAndLoginTestUser(getApp(), {
      email: 'invite-by-id-accept-player@example.com',
      password: TEST_PASSWORD,
      displayName: 'Invite Player',
    })

    const acceptResponse = await player.agent
      .post(`/api/campaign-invites/by-id/${invite.id}/accept`)
      .set(CSRF_HEADER, player.csrfToken)
      .expect(200)

    expect(acceptResponse.body).toMatchObject({ inviteId: invite.id, campaignId })
  })

  it('lists pending invites for the authenticated invitee', async () => {
    const { agent, csrfToken } = await registerOwner('mine-route-owner@example.com')
    const campaignId = await createTestCampaign(agent, csrfToken, 'Mine Route Campaign')

    await agent
      .post(`/api/campaigns/${campaignId}/invites`)
      .set(CSRF_HEADER, csrfToken)
      .send({ email: 'mine-route-player@example.com' })
      .expect(201)

    const player = await registerAndLoginTestUser(getApp(), {
      email: 'mine-route-player@example.com',
      password: TEST_PASSWORD,
      displayName: 'Mine Player',
    })

    const response = await player.agent.get('/api/campaign-invites/mine').expect(200)

    expect(response.body.invites).toHaveLength(1)
    expect(response.body.invites[0]).toMatchObject({
      campaignId,
      campaignName: 'Mine Route Campaign',
      inviterDisplayName: 'Campaign Owner',
    })
  })

  it('requires authentication for invitee pending list', async () => {
    await request(getApp()).get('/api/campaign-invites/mine').expect(401)
  })
})
