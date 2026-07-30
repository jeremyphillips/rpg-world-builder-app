import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import { registerAndLoginTestUser } from '../../test/auth-agent'
import { clearTestDb } from '../../test/db'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { useIntegrationApp } from '../../test/setup/integration-app'
import { publishNotification } from './publish-notification.service'

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
        messageId: 'message-1',
        senderDisplayName: 'Ava',
        preview: 'Ready for tonight?',
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
})
