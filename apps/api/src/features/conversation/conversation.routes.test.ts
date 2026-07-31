import request from 'supertest'
import type { Agent } from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CSRF_HEADER } from '../../lib/cookies'
import * as mongoTransaction from '../../lib/mongo-transaction'
import {
  createTestCampaign,
  registerAndLoginTestUser,
  registerTestUser,
} from '../../test/auth-agent'
import { registerCampaignMember } from '../../test/helpers/campaign-membership'
import { clearTestDb } from '../../test/db'
import { useIntegrationDb } from '../../test/setup/integration-db'
import { useIntegrationApp } from '../../test/setup/integration-app'
import { ConversationModel } from './conversation.model'
import { MessageModel } from './message.model'
import { NotificationModel } from '../notification/notification.model'
import { directMessageDedupeKey } from '../notification/notification-dedupe-keys'

const getApp = useIntegrationApp()

useIntegrationDb()

afterEach(() => {
  vi.restoreAllMocks()
})

async function sendFirstDirectMessage(
  agent: Agent,
  csrfToken: string,
  recipientUserId: string,
  text: string,
  clientMessageId?: string,
) {
  return agent
    .post('/api/conversations/direct/messages')
    .set(CSRF_HEADER, csrfToken)
    .send({
      recipientUserId,
      content: { kind: 'text', text },
      ...(clientMessageId ? { clientMessageId } : {}),
    })
    .expect(201)
}

describe('conversation routes', () => {
  it('requires authentication', async () => {
    await clearTestDb()
    await request(getApp()).get('/api/conversations').expect(401)
  })

  it('creates a conversation on first send, dedupes notifications, and marks read', async () => {
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

    const recipientsBeforeSend = await owner.agent
      .get('/api/conversations/direct/recipients')
      .expect(200)
    expect(recipientsBeforeSend.body.existingDirectByUserId).toEqual({})

    const listedBeforeSend = await owner.agent.get('/api/conversations').expect(200)
    expect(listedBeforeSend.body.items).toHaveLength(0)

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

    const created = await sendFirstDirectMessage(
      owner.agent,
      owner.csrfToken,
      member.userId,
      'Hello there',
      'draft-1',
    )

    const conversationId = created.body.conversation.id as string
    expect(created.body.conversation.peer.displayName).toBe('Campaign Member')
    expect(created.body.conversation.sharedCampaigns).toEqual([
      expect.objectContaining({ campaignName: 'Stormwatch' }),
    ])
    expect(created.body.message.content.text).toBe('Hello there')

    const recipientsAfterSend = await owner.agent
      .get('/api/conversations/direct/recipients')
      .expect(200)
    expect(recipientsAfterSend.body.existingDirectByUserId[member.userId]).toBe(conversationId)

    const secondSend = await owner.agent
      .post(`/api/conversations/${conversationId}/messages`)
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ content: { kind: 'text', text: 'Second ping' }, clientMessageId: 'draft-2' })
      .expect(201)

    expect(created.body.message.id).not.toBe(secondSend.body.message.id)

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
    expect(
      listedForMember.body.items.every((item: { latestMessage?: unknown }) => item.latestMessage),
    ).toBe(true)

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

    expect(retry.body.message.id).toBe(created.body.message.id)
  })

  it('dedupes first-send retries by clientMessageId without duplicate notifications', async () => {
    await clearTestDb()

    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'owner-first-idempotent@example.com',
      password: 'supersecret',
      displayName: 'Campaign Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Idempotent Harbor')

    const member = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'member-first-idempotent@example.com',
      displayName: 'Campaign Member',
      campaignRole: 'observer',
    })

    const first = await sendFirstDirectMessage(
      owner.agent,
      owner.csrfToken,
      member.userId,
      'First message',
      'first-send-1',
    )

    const conversationId = first.body.conversation.id as string

    await sendFirstDirectMessage(
      owner.agent,
      owner.csrfToken,
      member.userId,
      'First message',
      'first-send-1',
    )

    const notifications = await NotificationModel.find({
      recipientUserId: member.userId,
      dedupeKey: directMessageDedupeKey(conversationId),
    }).lean()

    expect(notifications).toHaveLength(1)
  })

  it('rejects ineligible recipients on first send', async () => {
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
      .post('/api/conversations/direct/messages')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({
        recipientUserId: outsider.userId,
        content: { kind: 'text', text: 'Hello outsider' },
      })
      .expect(403)

    const conversations = await ConversationModel.find().lean()
    expect(conversations).toHaveLength(0)
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

    const created = await sendFirstDirectMessage(
      owner.agent,
      owner.csrfToken,
      member.userId,
      'Hello member',
    )

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

    const createdA = await sendFirstDirectMessage(
      owner.agent,
      owner.csrfToken,
      memberA.userId,
      'Hello Alpha',
    )
    await sendFirstDirectMessage(owner.agent, owner.csrfToken, memberB.userId, 'Hello Beta')

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

    await sendFirstDirectMessage(owner.agent, owner.csrfToken, member.userId, 'Hello member')

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

  it('does not leave an empty conversation after a failed first send without transactions', async () => {
    await clearTestDb()
    vi.spyOn(mongoTransaction, 'areMongoTransactionsEnabled').mockReturnValue(false)
    vi.spyOn(MessageModel, 'create').mockRejectedValueOnce(
      new Error('Simulated message persist failure'),
    )

    const owner = await registerAndLoginTestUser(getApp(), {
      email: 'owner-failed-first@example.com',
      password: 'supersecret',
      displayName: 'Failed First Owner',
    })
    const campaignId = await createTestCampaign(owner.agent, owner.csrfToken, 'Failure Harbor')

    const member = await registerCampaignMember(getApp(), {
      campaignId,
      email: 'member-failed-first@example.com',
      displayName: 'Campaign Member',
      campaignRole: 'observer',
    })

    await owner.agent
      .post('/api/conversations/direct/messages')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({
        recipientUserId: member.userId,
        content: { kind: 'text', text: 'This should fail' },
      })
      .expect(500)

    const conversations = await ConversationModel.find().lean()
    expect(conversations).toHaveLength(0)
  })
})
