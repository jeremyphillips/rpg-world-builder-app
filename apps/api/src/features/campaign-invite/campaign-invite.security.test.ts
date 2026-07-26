import request from 'supertest'
import { afterEach, describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { createTestCampaign, registerAndLoginTestUser } from '../../test/auth-agent'
import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { useIntegrationApp } from '../../test/setup/integration-app'
import {
  createFakeEmailProvider,
  getFakeEmailSentMessages,
  resetFakeEmailSentMessages,
} from '../../services/email/providers/fake-email.provider'
import { setEmailProviderForTests } from '../../services/email/email.service'
import { generateInviteToken, hashInviteToken } from './campaign-invite-token'
import { CampaignInviteModel } from './campaign-invite.model'
import { createInviteRecord } from './campaign-invite.repository'
import { computeInviteExpiresAt } from './campaign-invite.lib'

const getApp = useIntegrationApp()
const TEST_PASSWORD = 'supersecret'

useIntegrationDb()

afterEach(() => {
  setEmailProviderForTests(undefined)
  resetFakeEmailSentMessages()
})

function extractInviteTokenFromEmail(text: string): string {
  const match = text.match(/\/campaign-invites\/([0-9a-f]{64})/)
  if (!match?.[1]) {
    throw new Error('Invite token not found in email body.')
  }
  return match[1]
}

describe('campaign invite security', () => {
  it('persists token hashes only', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    const doc = await CampaignInviteModel.findById(invite.id).lean()
    expect(doc?.tokenHash).toBe(hashInviteToken(rawToken))
    expect(doc).not.toHaveProperty('token')
    expect(JSON.stringify(doc)).not.toContain(rawToken)
  })

  it('does not expose tokenHash in admin API responses', async () => {
    setEmailProviderForTests(createFakeEmailProvider())
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp(), {
      email: 'security-owner@example.com',
      password: TEST_PASSWORD,
      displayName: 'Security Owner',
    })
    const campaignId = await createTestCampaign(agent, csrfToken, 'Security Campaign')

    const sendResponse = await agent
      .post(`/api/campaigns/${campaignId}/invites`)
      .set(CSRF_HEADER, csrfToken)
      .send({ email: 'security-player@example.com' })
      .expect(201)

    expect(sendResponse.body.invite).not.toHaveProperty('tokenHash')
    expect(JSON.stringify(sendResponse.body)).not.toMatch(/"tokenHash"/)

    const listResponse = await agent.get(`/api/campaigns/${campaignId}/invites`).expect(200)
    expect(listResponse.body.invites[0]).not.toHaveProperty('tokenHash')
    expect(JSON.stringify(listResponse.body)).not.toMatch(/"tokenHash"/)
  })

  it('masks invited email on public resolve', async () => {
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp(), {
      email: 'mask-owner@example.com',
      password: TEST_PASSWORD,
      displayName: 'Mask Owner',
    })
    const campaignId = await createTestCampaign(agent, csrfToken, 'Mask Campaign')
    const rawToken = generateInviteToken()

    await createInviteRecord({
      campaignId,
      email: 'long.player.name@example.com',
      normalizedEmail: 'long.player.name@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: 'owner-id',
    })

    const response = await request(getApp()).get(`/api/campaign-invites/${rawToken}`).expect(200)

    expect(response.body.resolution).toMatchObject({
      invitedEmailMasked: 'l***@example.com',
    })
    expect(response.body.resolution).not.toHaveProperty('tokenHash')
    expect(JSON.stringify(response.body)).not.toMatch(/"tokenHash"/)
  })

  it('delivers invite links only through email, not API responses', async () => {
    setEmailProviderForTests(createFakeEmailProvider())
    const { agent, csrfToken } = await registerAndLoginTestUser(getApp(), {
      email: 'email-only-owner@example.com',
      password: TEST_PASSWORD,
      displayName: 'Email Owner',
    })
    const campaignId = await createTestCampaign(agent, csrfToken, 'Email Only Campaign')

    const sendResponse = await agent
      .post(`/api/campaigns/${campaignId}/invites`)
      .set(CSRF_HEADER, csrfToken)
      .send({ email: 'email-only-player@example.com' })
      .expect(201)

    const emailText = getFakeEmailSentMessages()[0]?.text ?? ''
    const rawToken = extractInviteTokenFromEmail(emailText)

    expect(sendResponse.body.invite).not.toHaveProperty('token')
    expect(JSON.stringify(sendResponse.body)).not.toContain(rawToken)
    expect(emailText).toContain(rawToken)
  })
})
