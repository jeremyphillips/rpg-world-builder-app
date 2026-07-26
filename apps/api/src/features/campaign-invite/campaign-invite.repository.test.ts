import { describe, expect, it } from 'vitest'

import { CAMPAIGN_INVITE_EXPIRY_DAYS } from '@rpg/contracts'

import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { generateInviteToken, hashInviteToken } from './campaign-invite-token'
import {
  beginInviteDeliveryAttempt,
  createInviteRecord,
  findActiveInviteByCampaignAndEmail,
  findInviteByTokenHash,
  markInviteAccepted,
  markInviteDeliveryFailed,
  markInviteExpired,
  markInviteSent,
  rotateInviteToken,
} from './campaign-invite.repository'

useIntegrationDb()

function inviteExpiryDate(): Date {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + CAMPAIGN_INVITE_EXPIRY_DAYS)
  return expiresAt
}

describe('campaign invite repository', () => {
  it('creates and looks up invites by token hash', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: inviteExpiryDate(),
      invitedByUserId: owner.id,
    })

    expect(invite.status).toBe('pending')
    expect(invite.deliveryStatus).toBe('pending')
    expect(await findInviteByTokenHash(hashInviteToken(rawToken))).toMatchObject({
      id: invite.id,
      email: 'player@example.com',
    })
  })

  it('tracks delivery attempts separately from rotation', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const invite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: inviteExpiryDate(),
      invitedByUserId: owner.id,
    })

    const afterAttempt = await beginInviteDeliveryAttempt(invite.id)
    expect(afterAttempt?.deliveryAttempts).toBe(1)

    const rotated = await rotateInviteToken(
      invite.id,
      hashInviteToken(generateInviteToken()),
      inviteExpiryDate(),
    )
    expect(rotated?.deliveryAttempts).toBe(1)

    const sent = await markInviteSent(invite.id)
    expect(sent?.deliveryStatus).toBe('sent')
    expect(sent?.deliveryAttempts).toBe(1)
  })

  it('marks delivery failures without incrementing attempts again', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const invite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: inviteExpiryDate(),
      invitedByUserId: owner.id,
    })

    await beginInviteDeliveryAttempt(invite.id)
    const failed = await markInviteDeliveryFailed(invite.id, 'smtp_send_failed')
    expect(failed).toMatchObject({
      deliveryStatus: 'failed',
      deliveryErrorCode: 'smtp_send_failed',
      deliveryAttempts: 1,
    })
  })

  it('enforces one active invite per campaign and email', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: inviteExpiryDate(),
      invitedByUserId: owner.id,
    })

    await expect(
      createInviteRecord({
        campaignId,
        email: 'player@example.com',
        normalizedEmail: 'player@example.com',
        tokenHash: hashInviteToken(generateInviteToken()),
        expiresAt: inviteExpiryDate(),
        invitedByUserId: owner.id,
      }),
    ).rejects.toMatchObject({ code: 11000 })
  })

  it('allows a new invite after the previous active invite expires', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const first = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: inviteExpiryDate(),
      invitedByUserId: owner.id,
    })

    await markInviteExpired(first.id)

    const second = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: inviteExpiryDate(),
      invitedByUserId: owner.id,
    })

    expect(second.id).not.toBe(first.id)
    expect(
      await findActiveInviteByCampaignAndEmail(campaignId, 'player@example.com'),
    ).toMatchObject({ id: second.id, status: 'pending' })
  })

  it('transitions accepted invites to expired', async () => {
    const { id: campaignId, owner } = await makeTestCampaign()
    const invite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: inviteExpiryDate(),
      invitedByUserId: owner.id,
    })

    const accepted = await markInviteAccepted(invite.id, owner.id, new Date())
    expect(accepted?.status).toBe('accepted')

    const expired = await markInviteExpired(invite.id)
    expect(expired?.status).toBe('expired')
  })
})
