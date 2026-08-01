import { describe, expect, it } from 'vitest'

import { crossAppCampaignDetailPath } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'

import { resolveNotificationActionPath } from './resolve-notification-action'

describe('resolveNotificationActionPath', () => {
  it('maps campaign detail actions to cross-app paths', () => {
    expect(
      resolveNotificationActionPath({
        kind: 'campaign_detail',
        campaignId: 'campaign-123',
      }),
    ).toBe(crossAppCampaignDetailPath('campaign-123'))
  })

  it('maps conversation detail actions to dashboard SPA routes', () => {
    expect(
      resolveNotificationActionPath({
        kind: 'conversation_detail',
        conversationId: 'conversation-123',
      }),
    ).toBe(ROUTES.messages.detail('conversation-123'))
  })

  it('preserves optional campaign scope on conversation deep links', () => {
    expect(
      resolveNotificationActionPath(
        {
          kind: 'conversation_detail',
          conversationId: 'conversation-123',
        },
        'campaign-456',
      ),
    ).toBe(ROUTES.messages.detail('conversation-123', { campaignId: 'campaign-456' }))
  })

  it('returns undefined when no action exists', () => {
    expect(resolveNotificationActionPath(undefined)).toBeUndefined()
  })

  it('maps invite review actions to the public review path', () => {
    expect(
      resolveNotificationActionPath({
        kind: 'campaign_invite_review',
        inviteId: 'invite-123',
      }),
    ).toBe('/campaign-invites/invite-123')
  })
})
