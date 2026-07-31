import { describe, expect, it } from 'vitest'

import { crossAppCampaignDetailPath, crossAppConversationPath } from '@rpg/contracts'

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

  it('maps conversation detail actions to cross-app paths', () => {
    expect(
      resolveNotificationActionPath({
        kind: 'conversation_detail',
        conversationId: 'conversation-123',
      }),
    ).toBe(crossAppConversationPath('conversation-123'))
  })

  it('returns undefined when no action exists', () => {
    expect(resolveNotificationActionPath(undefined)).toBeUndefined()
  })
})
