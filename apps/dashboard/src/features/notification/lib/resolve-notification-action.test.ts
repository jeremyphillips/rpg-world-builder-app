import { describe, expect, it } from 'vitest'

import { crossAppCampaignDetailPath, dashboardCampaignInviteReviewPath } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { resolveNotificationActionPath } from './resolve-notification-action'

const inviteReceivedNotification = {
  type: 'campaign.invite.received' as const,
  payload: {
    campaignId: 'camp_1',
    campaignName: 'Stormwatch',
    inviteId: 'a'.repeat(24),
    inviterDisplayName: 'Alex',
  },
}

describe('resolveNotificationActionPath', () => {
  it('maps campaign detail actions to cross-app paths', () => {
    expect(
      resolveNotificationActionPath({
        type: 'campaign.invite.accepted',
        payload: {
          inviteId: 'invite_1',
          campaignId: 'campaign-123',
          campaignName: 'Stormwatch',
          acceptedByDisplayName: 'Player',
        },
        action: {
          kind: 'campaign_detail',
          campaignId: 'campaign-123',
        },
      }),
    ).toBe(crossAppCampaignDetailPath('campaign-123'))
  })

  it('maps conversation detail actions to dashboard SPA routes', () => {
    expect(
      resolveNotificationActionPath({
        type: 'message.direct.received',
        payload: {
          conversationId: 'conversation-123',
          messageId: 'message-1',
          senderDisplayName: 'Bobby',
          preview: 'blah',
          unreadMessageCount: 1,
          campaignIds: [],
        },
        action: {
          kind: 'conversation_detail',
          conversationId: 'conversation-123',
        },
      }),
    ).toBe(ROUTES.messages.detail('conversation-123'))
  })

  it('preserves optional campaign scope on conversation deep links', () => {
    expect(
      resolveNotificationActionPath(
        {
          type: 'message.direct.received',
          payload: {
            conversationId: 'conversation-123',
            messageId: 'message-1',
            senderDisplayName: 'Bobby',
            preview: 'blah',
            unreadMessageCount: 1,
            campaignIds: ['campaign-456'],
          },
          action: {
            kind: 'conversation_detail',
            conversationId: 'conversation-123',
          },
        },
        'campaign-456',
      ),
    ).toBe(ROUTES.messages.detail('conversation-123', { campaignId: 'campaign-456' }))
  })

  it('returns undefined when no action exists', () => {
    expect(
      resolveNotificationActionPath({
        ...inviteReceivedNotification,
        action: undefined,
      }),
    ).toBeUndefined()
  })

  it('maps invite review actions to the dashboard review path', () => {
    const inviteId = 'a'.repeat(24)

    expect(
      resolveNotificationActionPath({
        ...inviteReceivedNotification,
        action: { kind: 'campaign_invite_review', inviteId },
      }),
    ).toBe(dashboardCampaignInviteReviewPath(inviteId))
  })

  it('falls back to payload inviteId when action inviteId is missing', () => {
    const inviteId = 'b'.repeat(24)

    expect(
      resolveNotificationActionPath({
        ...inviteReceivedNotification,
        payload: { ...inviteReceivedNotification.payload, inviteId },
        action: { kind: 'campaign_invite_review', inviteId: '' },
      }),
    ).toBe(dashboardCampaignInviteReviewPath(inviteId))
  })

  it('returns undefined for malformed invite ids instead of /undefined paths', () => {
    expect(
      resolveNotificationActionPath({
        ...inviteReceivedNotification,
        payload: { ...inviteReceivedNotification.payload, inviteId: 'not-an-id' },
        action: { kind: 'campaign_invite_review', inviteId: 'undefined' },
      }),
    ).toBeUndefined()
  })
})
