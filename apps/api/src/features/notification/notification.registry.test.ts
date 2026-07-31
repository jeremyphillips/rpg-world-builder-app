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

  it('formats invite received without an action', () => {
    const preview = formatNotificationPreview('campaign.invite.received', {
      inviteId: 'invite-1',
      campaignId: 'campaign-1',
      campaignName: 'Stormwatch',
      inviterDisplayName: 'Ava',
    })

    expect(preview.title).toBe('Campaign invitation')
    expect(preview.description).toContain('invite email')
    expect(
      resolveNotificationAction('campaign.invite.received', {
        inviteId: 'invite-1',
        campaignId: 'campaign-1',
        campaignName: 'Stormwatch',
        inviterDisplayName: 'Ava',
      }),
    ).toBeUndefined()
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

  it('formats direct message previews without an action', () => {
    expect(
      resolveNotificationAction('message.direct.received', {
        messageId: 'message-1',
        senderDisplayName: 'Ava',
        preview: 'Ready for tonight?',
      }),
    ).toBeUndefined()
  })
})
