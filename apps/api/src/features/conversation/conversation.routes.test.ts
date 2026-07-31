import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import {
  createTestCampaign,
  registerAndLoginTestUser,
  registerTestUser,
} from '../../test/auth-agent'
import { registerCampaignMember } from '../../test/helpers/campaign-membership'
import { clearTestDb } from '../../test/db'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { useIntegrationApp } from '../../test/setup/integration-app'
import { NotificationModel } from '../notification/notification.model'
import { directMessageDedupeKey } from '../notification/notification-dedupe-keys'

const getApp = useIntegrationApp()

useIntegrationDb()

describe('conversation routes', () => {
  it('requires authentication', async () => {
    await clearTestDb()
    await request(getApp()).get('/api/conversations').expect(401)
  })

  it('creates a conversation, sends messages, dedupes notifications, and marks read', async () => {
    await clearTestDb()

    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'owner-dm@example.com',
      password: 'supersecret',
      displayName: 'Campaign Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Stormwatch')

    const member = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'member-dm@example.com',
      displayName: 'Campaign Member',
      campaignRole: 'observer',
    })

    const recipients = await owner.agent.get('/api/conversations/direct/recipients').expect(200)
    expect(recipients.body.recipientsByUserId).toEqual(
      expect.objectContaining({
        [member.userId]: expect.objectContaining({
          userId: member.userId,
          displayName: 'Campaign Member',
        }),
      }),
    )
    expect(recipients.body.campaigns).toEqual([
      expect.objectContaining({
        campaignName: 'Stormwatch',
        userIds: [member.userId],
      }),
    ])

    const created = await owner.agent
      .post('/api/conversations/direct')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ recipientUserId: member.userId })
      .expect(201)

    const conversationId = created.body.conversation.id as string
    expect(created.body.conversation.peer.displayName).toBe('Campaign Member')
    expect(created.body.conversation.sharedCampaigns).toEqual([
      expect.objectContaining({ campaignName: 'Stormwatch' }),
    ])

    const firstSend = await owner.agent
      .post(`/api/conversations/${conversationId}/messages`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ content: { kind: 'text', text: 'Hello there' }, clientMessageId: 'draft-1' })
      .expect(201)

    const secondSend = await owner.agent
      .post(`/api/conversations/${conversationId}/messages`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ content: { kind: 'text', text: 'Second ping' }, clientMessageId: 'draft-2' })
      .expect(201)

    expect(firstSend.body.message.id).not.toBe(secondSend.body.message.id)

    const notification = await NotificationModel.findOne({
      recipientUserId: member.userId,
      dedupeKey: directMessageDedupeKey(conversationId),
    }).lean()

    expect(notification?.payload).toMatchObject({
      unreadMessageCount: 2,
    })
    expect(notification?.readAt).toBeNull()

    const listedForMember = await member.agent.get('/api/conversations').expect(200)
    expect(listedForMember.body.items[0].unreadCount).toBe(2)

    const messages = await member.agent
      .get(`/api/conversations/${conversationId}/messages?limit=10`)
      .expect(200)
    expect(messages.body.items).toHaveLength(2)

    await member.agent
      .patch(`/api/conversations/${conversationId}/read`)
      .set(CSRF_HEADER, member.csrfToken)
      .send({ lastReadMessageId: secondSend.body.message.id })
      .expect(200)

    const afterRead = await NotificationModel.findOne({
      recipientUserId: member.userId,
      dedupeKey: directMessageDedupeKey(conversationId),
    }).lean()
    expect(afterRead?.readAt).toBeTruthy()

    const retry = await owner.agent
      .post(`/api/conversations/${conversationId}/messages`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ content: { kind: 'text', text: 'Hello there' }, clientMessageId: 'draft-1' })
      .expect(201)

    expect(retry.body.message.id).toBe(firstSend.body.message.id)
  })

  it('rejects ineligible recipients', async () => {
    await clearTestDb()

    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'solo-owner@example.com',
      password: 'supersecret',
      displayName: 'Solo Owner',
    })
    const outsider = await registerTestUser(getApp(), {
      email: 'outsider@example.com',
      password: 'supersecret',
      displayName: 'Outsider',
    })

    await owner.agent
      .post('/api/conversations/direct')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ recipientUserId: outsider.userId })
      .expect(403)
  })

  it('returns 404 when a non-participant lists messages', async () => {
    await clearTestDb()

    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'owner-list@example.com',
      password: 'supersecret',
      displayName: 'Campaign Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'List Gate')

    const member = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'member-list@example.com',
      displayName: 'Campaign Member',
      campaignRole: 'observer',
    })

    const outsider = await registerAndLoginTestUser(getApp(), {
      email: 'outsider-list@example.com',
      password: 'supersecret',
      displayName: 'Outsider',
    })

    const created = await owner.agent
      .post('/api/conversations/direct')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ recipientUserId: member.userId })
      .expect(201)

    const conversationId = created.body.conversation.id as string

    await outsider.agent.get(`/api/conversations/${conversationId}/messages?limit=10`).expect(404)
  })

  it('filters conversations by campaign scope with full-dataset counts', async () => {
    await clearTestDb()

    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'owner-scope@example.com',
      password: 'supersecret',
      displayName: 'Scope Owner',
    })
    const campaignA = await createTestCampaign(owner.agent, owner.csrfToken, 'Campaign Alpha')
    const campaignB = await createTestCampaign(owner.agent, owner.csrfToken, 'Campaign Beta')

    const memberA = await registerCampaignMember(getApp(), {
      campaignId: campaignA,
      email: 'member-a@example.com',
      displayName: 'Member Alpha',
      campaignRole: 'observer',
    })
    const memberB = await registerCampaignMember(getApp(), {
      campaignId: campaignB,
      email: 'member-b@example.com',
      displayName: 'Member Beta',
      campaignRole: 'observer',
    })

    const createdA = await owner.agent
      .post('/api/conversations/direct')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ recipientUserId: memberA.userId })
      .expect(201)
    await owner.agent
      .post('/api/conversations/direct')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ recipientUserId: memberB.userId })
      .expect(201)

    const scoped = await owner.agent
      .get(`/api/conversations?campaignId=${campaignA}&limit=1`)
      .expect(200)

    expect(scoped.body.items).toHaveLength(1)
    expect(scoped.body.items[0].id).toBe(createdA.body.conversation.id)
    expect(scoped.body.totalCount).toBe(2)
    expect(scoped.body.scopedCount).toBe(1)
    expect(scoped.body.hiddenCount).toBe(1)
    expect(scoped.body.scope).toEqual(
      expect.objectContaining({
        campaignId: campaignA,
        campaignName: 'Campaign Alpha',
      }),
    )
  })

  it('returns unscoped list with scopeInvalid for inaccessible campaignId', async () => {
    await clearTestDb()

    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'owner-invalid-scope@example.com',
      password: 'supersecret',
      displayName: 'Invalid Scope Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Valid Campaign')
    const member = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'member-invalid-scope@example.com',
      displayName: 'Valid Member',
      campaignRole: 'observer',
    })

    await owner.agent
      .post('/api/conversations/direct')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ recipientUserId: member.userId })
      .expect(201)

    const invalid = await owner.agent
      .get('/api/conversations?campaignId=507f1f77bcf86cd799439011')
      .expect(200)

    expect(invalid.body.scopeInvalid).toBe(true)
    expect(invalid.body.items).toHaveLength(1)
    expect(invalid.body.totalCount).toBeUndefined()
    expect(invalid.body.scopedCount).toBeUndefined()
  })

  it('scopes direct message recipients by campaignId', async () => {
    await clearTestDb()

    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'owner-recipients-scope@example.com',
      password: 'supersecret',
      displayName: 'Recipient Scope Owner',
    })
    const campaignA = await createTestCampaign(owner.agent, owner.csrfToken, 'Recipients Alpha')
    const campaignB = await createTestCampaign(owner.agent, owner.csrfToken, 'Recipients Beta')

    const memberA = await registerCampaignMember(getApp(), {
      campaignId: campaignA,
      email: 'recipients-a@example.com',
      displayName: 'Recipients A',
      campaignRole: 'observer',
    })
    await registerCampaignMember(getApp(), {
      campaignId: campaignB,
      email: 'recipients-b@example.com',
      displayName: 'Recipients B',
      campaignRole: 'observer',
    })

    const scoped = await owner.agent
      .get(`/api/conversations/direct/recipients?campaignId=${campaignA}`)
      .expect(200)

    expect(Object.keys(scoped.body.recipientsByUserId)).toEqual([memberA.userId])
    expect(scoped.body.scope).toEqual(
      expect.objectContaining({
        campaignId: campaignA,
        campaignName: 'Recipients Alpha',
      }),
    )
  })
})
