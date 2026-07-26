import { afterEach, describe, expect, it } from 'vitest'

import { CAMPAIGN_INVITE_EXPIRY_DAYS } from '@rpg/contracts'

import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { deliverCampaignInviteEmail } from '../../features/campaign-invite/campaign-invite-delivery'
import {
  generateInviteToken,
  hashInviteToken,
} from '../../features/campaign-invite/campaign-invite-token'
import { createInviteRecord } from '../../features/campaign-invite/campaign-invite.repository'
import {
  buildCampaignInviteUrl,
  sendCampaignInviteEmail,
  setEmailProviderForTests,
} from './email.service'
import {
  createFakeEmailProvider,
  getFakeEmailSentMessages,
  setFakeEmailSendResult,
} from './providers/fake-email.provider'

useIntegrationDb()

afterEach(() => {
  setEmailProviderForTests(undefined)
})

function inviteExpiryDate(): Date {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + CAMPAIGN_INVITE_EXPIRY_DAYS)
  return expiresAt
}

describe('email service', () => {
  it('builds invite URLs from APP_BASE_URL', () => {
    expect(buildCampaignInviteUrl('abc123')).toBe('http://localhost:8080/campaign-invites/abc123')
  })

  it('sends campaign invite email through the fake provider', async () => {
    const provider = createFakeEmailProvider()
    setEmailProviderForTests(provider)

    const result = await sendCampaignInviteEmail({
      inviteId: 'invite-1',
      campaignName: 'The Argent Road',
      inviterName: 'Ari',
      recipientEmail: 'player@example.com',
      rawToken: 'raw-token',
    })

    expect(result).toEqual({ ok: true })
    expect(getFakeEmailSentMessages()).toHaveLength(1)
    expect(getFakeEmailSentMessages()[0]).toMatchObject({
      to: { email: 'player@example.com' },
      subject: expect.stringContaining('The Argent Road'),
      text: expect.stringContaining('/campaign-invites/raw-token'),
    })
  })

  it('records delivery failures without throwing', async () => {
    setEmailProviderForTests(setFakeEmailSendResult({ ok: false, errorCode: 'smtp_send_failed' }))

    const result = await sendCampaignInviteEmail({
      inviteId: 'invite-1',
      campaignName: 'The Argent Road',
      inviterName: 'Ari',
      recipientEmail: 'player@example.com',
      rawToken: 'raw-token',
    })

    expect(result).toEqual({ ok: false, errorCode: 'smtp_send_failed' })
    expect(getFakeEmailSentMessages()).toHaveLength(0)
  })

  it('delivers a persisted invite through the fake provider', async () => {
    const provider = createFakeEmailProvider()
    setEmailProviderForTests(provider)

    const {
      id: campaignId,
      owner,
      identity,
    } = await makeTestCampaign({
      name: 'Delivery Test Campaign',
    })
    const rawToken = generateInviteToken()
    const invite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: inviteExpiryDate(),
      invitedByUserId: owner.id,
    })

    const deliveryStatus = await deliverCampaignInviteEmail({
      inviteId: invite.id,
      campaignName: identity.name,
      inviterName: owner.displayName,
      recipientEmail: invite.email,
      rawToken,
      provider,
    })

    expect(deliveryStatus).toBe('sent')
    expect(getFakeEmailSentMessages()).toHaveLength(1)
  })
})
