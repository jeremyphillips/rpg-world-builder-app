import { describe, expect, it } from 'vitest'

import { NOTIFICATION_TYPES } from '@rpg/contracts'

import {
  formatNotificationPreview,
  getNotificationClassification,
  notificationRegistryTypes,
  resolveNotificationAction,
} from './notification.registry'

describe('notification registry', () => {
  it('covers every notification type', () => {
    expect(notificationRegistryTypes.sort()).toEqual([...NOTIFICATION_TYPES].sort())
  })

  it('exposes classification defaults for every notification type', () => {
    for (const type of NOTIFICATION_TYPES) {
      expect(getNotificationClassification(type)).toMatchObject({
        category: expect.any(String),
        topic: expect.any(String),
        priority: 'normal',
      })
    }
  })

  it('formats invite received with review action', () => {
    const preview = formatNotificationPreview('campaign.invite.received', {
      inviteId: 'invite-1',
      campaignId: 'campaign-1',
      campaignName: 'Stormwatch',
      inviterDisplayName: 'Ava',
    })

    expect(preview.title).toBe('Campaign invitation')
    expect(preview.description).toBe('Ava invited you to join Stormwatch.')
    expect(
      resolveNotificationAction('campaign.invite.received', {
        inviteId: 'invite-1',
        campaignId: 'campaign-1',
        campaignName: 'Stormwatch',
        inviterDisplayName: 'Ava',
      }),
    ).toEqual({
      kind: 'campaign_invite_review',
      inviteId: 'invite-1',
    })
  })

  it('resolves manager invite actions to campaign detail', () => {
    const acceptedPayload = {
      inviteId: 'invite-1',
      campaignId: 'campaign-1',
      campaignName: 'Stormwatch',
      acceptedByDisplayName: 'Blake',
    }
    const completedPayload = {
      inviteId: 'invite-1',
      campaignId: 'campaign-1',
      campaignName: 'Stormwatch',
      completedByDisplayName: 'Blake',
    }

    expect(resolveNotificationAction('campaign.invite.accepted', acceptedPayload)).toEqual({
      kind: 'campaign_detail',
      campaignId: 'campaign-1',
    })
    expect(resolveNotificationAction('campaign.invite.completed', completedPayload)).toEqual({
      kind: 'campaign_detail',
      campaignId: 'campaign-1',
    })
  })

  it('formats direct message previews with conversation detail actions', () => {
    const payload = {
      conversationId: 'conversation-1',
      messageId: 'message-1',
      senderDisplayName: 'Ava',
      preview: 'Ready for tonight?',
      unreadMessageCount: 1,
      campaignIds: [],
    }

    expect(resolveNotificationAction('message.direct.received', payload)).toEqual({
      kind: 'conversation_detail',
      conversationId: 'conversation-1',
    })

    expect(formatNotificationPreview('message.direct.received', payload).title).toBe('New message')
  })

  it('uses count copy for multiple unread direct messages', () => {
    const preview = formatNotificationPreview('message.direct.received', {
      conversationId: 'conversation-1',
      messageId: 'message-3',
      senderDisplayName: 'Ava',
      preview: 'Latest line',
      unreadMessageCount: 3,
      campaignIds: [],
    })

    expect(preview.title).toBe('3 new messages')
    expect(preview.description).toContain('Latest line')
  })
})
