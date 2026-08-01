import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { makeTestUser } from '../../test/fixtures/users'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { publishNotification } from './publish-notification.service'
import {
  campaignInviteDedupeKey,
  campaignInviteInviteeLifecycleDedupeKey,
} from './notification-dedupe-keys'
import {
  findNotificationByDedupeKey,
  markNotificationsSeen,
  markNotificationRead as markNotificationReadRecord,
} from './notification.repository'
import { listNotifications, markAllNotificationsRead } from './notification.service'
import { countUnreadNotifications } from './notification.repository'

useIntegrationDb()

describe('notification service', () => {
  it('dedupes rows and only resets read state on material preview changes', async () => {
    const recipient = await makeTestUser({ email: 'notify-recipient@example.com' })

    await publishNotification({
      type: 'campaign.invite.received',
      recipientUserIds: [recipient.id],
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey('invite-1'),
      payload: {
        inviteId: 'invite-1',
        campaignId: 'campaign-1',
        campaignName: 'Stormwatch',
        inviterDisplayName: 'Ava',
      },
    })

    const first = await findNotificationByDedupeKey({
      recipientUserId: recipient.id,
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey('invite-1'),
    })
    expect(first).toBeTruthy()

    await markNotificationReadRecord({
      recipientUserId: recipient.id,
      notificationId: first!.id,
    })

    await publishNotification({
      type: 'campaign.invite.received',
      recipientUserIds: [recipient.id],
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey('invite-1'),
      payload: {
        inviteId: 'invite-1',
        campaignId: 'campaign-1',
        campaignName: 'Stormwatch',
        inviterDisplayName: 'Ava',
      },
    })

    const unchangedResend = await findNotificationByDedupeKey({
      recipientUserId: recipient.id,
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey('invite-1'),
    })
    expect(unchangedResend?.readAt).toBeTruthy()

    await publishNotification({
      type: 'campaign.invite.received',
      recipientUserIds: [recipient.id],
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey('invite-1'),
      payload: {
        inviteId: 'invite-1',
        campaignId: 'campaign-1',
        campaignName: 'Stormwatch Revised',
        inviterDisplayName: 'Ava',
      },
    })

    const changedResend = await findNotificationByDedupeKey({
      recipientUserId: recipient.id,
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey('invite-1'),
    })
    expect(changedResend?.readAt).toBeNull()
  })

  it('lists notifications with unread count and marks all read idempotently', async () => {
    const recipient = await makeTestUser({ email: 'notify-list@example.com' })
    const { id: campaignId } = await makeTestCampaign()

    await publishNotification({
      type: 'campaign.invite.accepted',
      recipientUserIds: [recipient.id],
      dedupeKey: campaignInviteDedupeKey('invite-2', 'accepted'),
      payload: {
        inviteId: 'invite-2',
        campaignId,
        campaignName: 'Harbor',
        acceptedByDisplayName: 'Casey',
      },
    })

    const listed = await listNotifications(recipient.id, { limit: 10 })
    expect(listed.items).toHaveLength(1)
    expect(listed.unreadCount).toBe(1)

    const updated = await markAllNotificationsRead(recipient.id)
    expect(updated.updatedCount).toBe(1)
    expect(await countUnreadNotifications(recipient.id)).toBe(0)

    const secondPass = await markAllNotificationsRead(recipient.id)
    expect(secondPass.updatedCount).toBe(0)
  })

  it('marks only valid unseen notification ids as seen', async () => {
    const recipient = await makeTestUser({ email: 'notify-seen@example.com' })

    await publishNotification({
      type: 'campaign.invite.received',
      recipientUserIds: [recipient.id],
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey('invite-seen'),
      payload: {
        inviteId: 'invite-seen',
        campaignId: 'campaign-1',
        campaignName: 'Stormwatch',
        inviterDisplayName: 'Ava',
      },
    })

    const notification = await findNotificationByDedupeKey({
      recipientUserId: recipient.id,
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey('invite-seen'),
    })
    expect(notification).toBeTruthy()

    const updatedCount = await markNotificationsSeen({
      recipientUserId: recipient.id,
      ids: [notification!.id, 'not-an-object-id'],
    })
    expect(updatedCount).toBe(1)

    const afterSeen = await findNotificationByDedupeKey({
      recipientUserId: recipient.id,
      dedupeKey: campaignInviteInviteeLifecycleDedupeKey('invite-seen'),
    })
    expect(afterSeen?.seenAt).toBeTruthy()
  })
})
