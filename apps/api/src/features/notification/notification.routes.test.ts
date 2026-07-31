import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { registerAndLoginTestUser } from '../../test/auth-agent'
import { clearTestDb } from '../../test/db'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { useIntegrationApp } from '../../test/setup/integration-app'
import { publishNotification } from './publish-notification.service'
import { campaignInviteDedupeKey } from './notification-dedupe-keys'

const getApp = useIntegrationApp()

useIntegrationDb()

describe('notification routes', () => {
  it('requires authentication', async () => {
    await clearTestDb()

    await request(getApp()).get('/api/notifications').expect(401)
  })

  it('lists notifications with unread count for the signed-in recipient', async () => {
    await clearTestDb()

    const { agent, csrfToken } = await registerAndLoginTestUser(getApp(), {
      email: 'notify-route@example.com',
      password: 'supersecret',
      displayName: 'Notify Route User',
    })

    const meRes = await agent.get('/api/auth/me').expect(200)
    const userId = meRes.body.user.id as string

    await publishNotification({
      type: 'message.direct.received',
      recipientUserIds: [userId],
      payload: {
        conversationId: 'conversation-1',
        messageId: 'message-1',
        senderDisplayName: 'Ava',
        preview: 'Ready for tonight?',
        unreadMessageCount: 1,
        campaignIds: [],
      },
    })

    const response = await agent.get('/api/notifications?limit=10').expect(200)

    expect(response.body.unreadCount).toBe(1)
    expect(response.body.items).toHaveLength(1)
    expect(response.body.items[0]).toMatchObject({
      type: 'message.direct.received',
      title: 'New message',
    })

    await agent.post('/api/notifications/mark-all-read').set(CSRF_HEADER, csrfToken).expect(200)

    const afterRead = await agent.get('/api/notifications?limit=10').expect(200)
    expect(afterRead.body.unreadCount).toBe(0)
  })

  it('returns unread count for the signed-in recipient', async () => {
    await clearTestDb()

    const { agent } = await registerAndLoginTestUser(getApp(), {
      email: 'notify-count@example.com',
      password: 'supersecret',
      displayName: 'Notify Count User',
    })

    const meRes = await agent.get('/api/auth/me').expect(200)
    const userId = meRes.body.user.id as string

    await publishNotification({
      type: 'message.direct.received',
      recipientUserIds: [userId],
      payload: {
        conversationId: 'conversation-2',
        messageId: 'message-2',
        senderDisplayName: 'Blake',
        preview: 'Hello',
        unreadMessageCount: 1,
        campaignIds: [],
      },
    })

    const response = await agent.get('/api/notifications/unread-count').expect(200)
    expect(response.body.unreadCount).toBe(1)
  })

  it('marks a single notification as read', async () => {
    await clearTestDb()

    const { agent, csrfToken } = await registerAndLoginTestUser(getApp(), {
      email: 'notify-read@example.com',
      password: 'supersecret',
      displayName: 'Notify Read User',
    })

    const meRes = await agent.get('/api/auth/me').expect(200)
    const userId = meRes.body.user.id as string

    await publishNotification({
      type: 'message.direct.received',
      recipientUserIds: [userId],
      payload: {
        conversationId: 'conversation-3',
        messageId: 'message-3',
        senderDisplayName: 'Casey',
        preview: 'Ping',
        unreadMessageCount: 1,
        campaignIds: [],
      },
    })

    const listed = await agent.get('/api/notifications?limit=10').expect(200)
    const notificationId = listed.body.items[0].id as string

    const response = await agent
      .patch(`/api/notifications/${notificationId}/read`)
      .set(CSRF_HEADER, csrfToken)
      .expect(200)

    expect(response.body.notification.readAt).toBeTruthy()
  })

  it('returns 404 for invalid or foreign notification ids on mark-read', async () => {
    await clearTestDb()

    const { agent, csrfToken } = await registerAndLoginTestUser(getApp(), {
      email: 'notify-read-404@example.com',
      password: 'supersecret',
      displayName: 'Notify Read 404 User',
    })

    await agent
      .patch('/api/notifications/not-an-object-id/read')
      .set(CSRF_HEADER, csrfToken)
      .expect(404)

    await agent
      .patch('/api/notifications/674f2f2f2f2f2f2f2f2f2f2f/read')
      .set(CSRF_HEADER, csrfToken)
      .expect(404)
  })

  it('marks rendered notifications as seen', async () => {
    await clearTestDb()

    const { agent, csrfToken } = await registerAndLoginTestUser(getApp(), {
      email: 'notify-seen@example.com',
      password: 'supersecret',
      displayName: 'Notify Seen User',
    })

    const meRes = await agent.get('/api/auth/me').expect(200)
    const userId = meRes.body.user.id as string

    await publishNotification({
      type: 'campaign.invite.received',
      recipientUserIds: [userId],
      dedupeKey: campaignInviteDedupeKey('invite-seen-1', 'received'),
      payload: {
        inviteId: 'invite-seen-1',
        campaignId: 'campaign-1',
        campaignName: 'Stormwatch',
        inviterDisplayName: 'Ava',
      },
    })

    const listed = await agent.get('/api/notifications?limit=10').expect(200)
    const notificationId = listed.body.items[0].id as string

    const response = await agent
      .post('/api/notifications/mark-seen')
      .set(CSRF_HEADER, csrfToken)
      .send({ ids: [notificationId] })
      .expect(200)

    expect(response.body.updatedCount).toBe(1)

    const afterSeen = await agent.get('/api/notifications?limit=10').expect(200)
    expect(afterSeen.body.items[0].seenAt).toBeTruthy()
  })

  it('rejects invalid pagination cursors', async () => {
    await clearTestDb()

    const { agent } = await registerAndLoginTestUser(getApp(), {
      email: 'notify-cursor@example.com',
      password: 'supersecret',
      displayName: 'Notify Cursor User',
    })

    await agent.get('/api/notifications?limit=10&cursor=not-a-valid-cursor').expect(400)
  })

  it('filters notifications by unread, category, and campaign scope', async () => {
    await clearTestDb()

    const { agent } = await registerAndLoginTestUser(getApp(), {
      email: 'notify-filters@example.com',
      password: 'supersecret',
      displayName: 'Notify Filters User',
    })

    const meRes = await agent.get('/api/auth/me').expect(200)
    const userId = meRes.body.user.id as string

    await publishNotification({
      type: 'message.direct.received',
      recipientUserIds: [userId],
      payload: {
        conversationId: 'conversation-filter-1',
        messageId: 'message-filter-1',
        senderDisplayName: 'Ava',
        preview: 'Hello',
        unreadMessageCount: 1,
        campaignIds: ['campaign-filter-1'],
      },
    })

    await publishNotification({
      type: 'campaign.invite.accepted',
      recipientUserIds: [userId],
      payload: {
        inviteId: 'invite-filter-1',
        campaignId: 'campaign-filter-1',
        campaignName: 'Stormwatch',
        acceptedByDisplayName: 'Blake',
      },
    })

    const unreadOnly = await agent.get('/api/notifications?limit=10&unread=true').expect(200)
    expect(unreadOnly.body.items).toHaveLength(2)

    const messageCategory = await agent
      .get('/api/notifications?limit=10&category=message')
      .expect(200)
    expect(messageCategory.body.items).toHaveLength(1)
    expect(messageCategory.body.items[0].type).toBe('message.direct.received')

    const campaignScope = await agent
      .get('/api/notifications?limit=10&campaignId=campaign-filter-1')
      .expect(200)
    expect(campaignScope.body.items).toHaveLength(2)
    expect(campaignScope.body.items.map((item: { type: string }) => item.type).sort()).toEqual([
      'campaign.invite.accepted',
      'message.direct.received',
    ])

    const missingCampaignScope = await agent
      .get('/api/notifications?limit=10&campaignId=missing-campaign')
      .expect(200)
    expect(missingCampaignScope.body.items).toHaveLength(0)
  })
})
