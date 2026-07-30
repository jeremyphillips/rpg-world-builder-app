import { describe, expect, it } from 'vitest'

import { NOTIFICATION_TYPES } from '@rpg/contracts'

import {
  formatNotificationPreview,
  notificationRegistryTypes,
  resolveNotificationAction,
} from './notification.registry'

describe('notification registry', () => {
  it('covers every notification type', () => {
    expect(notificationRegistryTypes.sort()).toEqual([...NOTIFICATION_TYPES].sort())
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
    const payload = {
      inviteId: 'invite-1',
      campaignId: 'campaign-1',
      campaignName: 'Stormwatch',
      acceptedByDisplayName: 'Blake',
    }

    expect(resolveNotificationAction('campaign.invite.accepted', payload)).toEqual({
      kind: 'campaign_detail',
      campaignId: 'campaign-1',
    })
  })
})
