import { afterEach, describe, expect, it, vi } from 'vitest'

import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { makeTestUser } from '../../test/fixtures/users'
import { useIntegrationDb } from '../../test/setup/integration-db'
import {
  createFakeEmailProvider,
  resetFakeEmailSentMessages,
} from '../../services/email/providers/fake-email.provider'
import { setEmailProviderForTests } from '../../services/email/email.service'
import {
  acceptCampaignInvite,
  revokeCampaignInvite,
  sendCampaignInvite,
} from '../campaign-invite/campaign-invite.service'
import { createInviteRecord } from '../campaign-invite/campaign-invite.repository'
import { computeInviteExpiresAt } from '../campaign-invite/campaign-invite.lib'
import { generateInviteToken, hashInviteToken } from '../campaign-invite/campaign-invite-token'
import { CampaignInviteModel } from '../campaign-invite/campaign-invite.model'
import {
  campaignInviteDedupeKey,
  campaignInviteInviteeLifecycleDedupeKey,
} from './notification-dedupe-keys'
import { findNotificationByDedupeKey } from './notification.repository'
import { NotificationModel } from './notification.model'
import { publishCampaignInviteAcceptedNotification } from './campaign-invite-notification.lib'

useIntegrationDb()

afterEach(() => {
  setEmailProviderForTests(undefined)
  resetFakeEmailSentMessages()
  vi.restoreAllMocks()
})

describe('campaign invite notification integration', () => {
  it('creates a received notification only when the invitee already has an account', async () => {
    const provider = createFakeEmailProvider()
    setEmailProviderForTests(provider)
    const player = await makeTestUser({ email: 'notify-player@example.com' })
    const { id: campaignId, owner } = await makeTestCampaign()

    await sendCampaignInvite({
      campaignId,
      email: 'notify-player@example.com',
      invitedByUserId: owner.id,
      provider,
    })

    const invite = await CampaignInviteModel.findOne({
      campaignId,
      normalizedEmail: 'notify-player@example.com',
    })
    expect(invite).toBeTruthy()

    await vi.waitFor(async () => {
      const notification = await findNotificationByDedupeKey({
        recipientUserId: player.id,
        dedupeKey: campaignInviteInviteeLifecycleDedupeKey(invite!.id),
      })
      expect(notification).toMatchObject({
        type: 'campaign.invite.received',
        title: 'Campaign invitation',
        action: { kind: 'campaign_invite_review', inviteId: invite!.id },
      })
    })
  })

  it('skips received notifications when the invite email has no matching user', async () => {
    const provider = createFakeEmailProvider()
    setEmailProviderForTests(provider)
    const { id: campaignId, owner } = await makeTestCampaign()

    const result = await sendCampaignInvite({
      campaignId,
      email: 'no-account@example.com',
      invitedByUserId: owner.id,
      provider,
    })

    const notification = await findNotificationByDedupeKey({
      recipientUserId: owner.id,
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey(result.invite.id),
    })
    expect(notification).toBeNull()
  })

  it('notifies campaign managers when an invite is accepted, excluding the actor', async () => {
    const { id: campaignId, owner } = await makeTestCampaign({ name: 'Notify Accept Campaign' })
    const player = await makeTestUser({
      email: 'notify-accept@example.com',
      displayName: 'Accepting Player',
    })
    const rawToken = generateInviteToken()

    const invite = await createInviteRecord({
      campaignId,
      email: 'notify-accept@example.com',
      normalizedEmail: 'notify-accept@example.com',
      tokenHash: hashInviteToken(rawToken),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })
    await CampaignInviteModel.findByIdAndUpdate(invite.id, { deliveryStatus: 'sent' })

    await acceptCampaignInvite({
      rawToken,
      userId: player.id,
      userEmail: player.email,
    })

    await vi.waitFor(async () => {
      const ownerNotification = await findNotificationByDedupeKey({
        recipientUserId: owner.id,
        dedupeKey: campaignInviteDedupeKey(invite.id, 'accepted'),
      })
      expect(ownerNotification).toMatchObject({
        type: 'campaign.invite.accepted',
        action: { kind: 'campaign_detail', campaignId },
      })
    })
    const playerNotification = await findNotificationByDedupeKey({
      recipientUserId: player.id,
      dedupeKey: campaignInviteDedupeKey(invite.id, 'accepted'),
    })
    expect(playerNotification).toBeNull()
  })

  it('resolves manager invite actions to campaign detail', async () => {
    const owner = await makeTestUser({ email: 'notify-manager@example.com' })
    const { id: campaignId } = await makeTestCampaign({ owner })
    const invite = await createInviteRecord({
      campaignId,
      email: 'player@example.com',
      normalizedEmail: 'player@example.com',
      tokenHash: hashInviteToken(generateInviteToken()),
      expiresAt: computeInviteExpiresAt(),
      invitedByUserId: owner.id,
    })

    await publishCampaignInviteAcceptedNotification({
      invite: { ...invite, status: 'accepted' },
      acceptedByUserId: 'some-other-user',
    })

    const notification = await findNotificationByDedupeKey({
      recipientUserId: owner.id,
      dedupeKey: campaignInviteDedupeKey(invite.id, 'accepted'),
    })
    expect(notification?.action).toEqual({
      kind: 'campaign_detail',
      campaignId,
    })
  })

  it('supersedes received notifications with cancelled copy and clears read state', async () => {
    const provider = createFakeEmailProvider()
    setEmailProviderForTests(provider)
    const player = await makeTestUser({ email: 'cancel-player@example.com' })
    const { id: campaignId, owner } = await makeTestCampaign({ name: 'Cancel Notify Campaign' })

    const sendResult = await sendCampaignInvite({
      campaignId,
      email: 'cancel-player@example.com',
      invitedByUserId: owner.id,
      provider,
    })

    await vi.waitFor(async () => {
      const received = await findNotificationByDedupeKey({
        recipientUserId: player.id,
        dedupeKey: campaignInviteInviteeLifecycleDedupeKey(sendResult.invite.id),
      })
      expect(received?.type).toBe('campaign.invite.received')
    })

    const received = await findNotificationByDedupeKey({
      recipientUserId: player.id,
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey(sendResult.invite.id),
    })
    expect(received).toBeTruthy()

    await NotificationModel.updateOne(
      { _id: received!.id },
      { $set: { readAt: new Date(), seenAt: new Date() } },
    )

    await revokeCampaignInvite({
      campaignId,
      inviteId: sendResult.invite.id,
      revokedByUserId: owner.id,
    })

    await vi.waitFor(async () => {
      const cancelled = await findNotificationByDedupeKey({
        recipientUserId: player.id,
        dedupeKey: campaignInviteInviteeLifecycleDedupeKey(sendResult.invite.id),
      })
      expect(cancelled).toMatchObject({
        type: 'campaign.invite.cancelled',
        title: 'Invitation cancelled',
        readAt: null,
        seenAt: null,
      })
      expect(cancelled?.action).toBeUndefined()
    })
  })
})
