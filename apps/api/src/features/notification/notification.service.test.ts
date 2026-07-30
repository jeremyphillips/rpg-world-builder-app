import { describe, expect, it } from 'vitest'

import { makeTestCampaign } from '../../test/fixtures/campaigns'
import { makeTestUser } from '../../test/fixtures/users'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { publishNotification } from './publish-notification.service'
import {
  countUnreadNotifications,
  findNotificationByDedupeKey,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.repository'
import { listNotifications } from './notification.service'

useIntegrationDb()

describe('notification service', () => {
  it('dedupes rows and only resets read state on material preview changes', async () => {
    const recipient = await makeTestUser({ email: 'notify-recipient@example.com' })

    await publishNotification({
      type: 'campaign.invite.received',
      recipientUserIds: [recipient.id],
      dedupeKey: 'campaign-invite:invite-1:received',
      payload: {
        inviteId: 'invite-1',
        campaignId: 'campaign-1',
        campaignName: 'Stormwatch',
        inviterDisplayName: 'Ava',
      },
    })

    const first = await findNotificationByDedupeKey({
      recipientUserId: recipient.id,
      dedupeKey: 'campaign-invite:invite-1:received',
    })
    expect(first).toBeTruthy()

    await markNotificationRead({
      recipientUserId: recipient.id,
      notificationId: first!.id,
    })

    await publishNotification({
      type: 'campaign.invite.received',
      recipientUserIds: [recipient.id],
      dedupeKey: 'campaign-invite:invite-1:received',
      payload: {
        inviteId: 'invite-1',
        campaignId: 'campaign-1',
        campaignName: 'Stormwatch',
        inviterDisplayName: 'Ava',
      },
    })

    const unchangedResend = await findNotificationByDedupeKey({
      recipientUserId: recipient.id,
      dedupeKey: 'campaign-invite:invite-1:received',
    })
    expect(unchangedResend?.readAt).toBeTruthy()

    await publishNotification({
      type: 'campaign.invite.received',
      recipientUserIds: [recipient.id],
      dedupeKey: 'campaign-invite:invite-1:received',
      payload: {
        inviteId: 'invite-1',
        campaignId: 'campaign-1',
        campaignName: 'Stormwatch Revised',
        inviterDisplayName: 'Ava',
      },
    })

    const changedResend = await findNotificationByDedupeKey({
      recipientUserId: recipient.id,
      dedupeKey: 'campaign-invite:invite-1:received',
    })
    expect(changedResend?.readAt).toBeNull()
  })

  it('lists notifications with unread count and marks all read idempotently', async () => {
    const recipient = await makeTestUser({ email: 'notify-list@example.com' })
    const { id: campaignId } = await makeTestCampaign()

    await publishNotification({
      type: 'campaign.invite.accepted',
      recipientUserIds: [recipient.id],
      dedupeKey: 'campaign-invite:invite-2:accepted',
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
    expect(updated).toBe(1)
    expect(await countUnreadNotifications(recipient.id)).toBe(0)

    const secondPass = await markAllNotificationsRead(recipient.id)
    expect(secondPass).toBe(0)
  })
})
