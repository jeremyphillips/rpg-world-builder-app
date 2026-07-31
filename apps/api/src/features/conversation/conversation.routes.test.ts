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
    expect(recipients.body.items).toEqual([
      expect.objectContaining({ userId: member.userId, displayName: 'Campaign Member' }),
    ])

    const created = await owner.agent
      .post('/api/conversations/direct')
      .set(CSRF_HEADER, owner.csrfToken)
      .send({ recipientUserId: member.userId })
      .expect(201)

    const conversationId = created.body.conversation.id as string
    expect(created.body.conversation.peer.displayName).toBe('Campaign Member')

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
})
