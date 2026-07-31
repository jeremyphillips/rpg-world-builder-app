import { describe, expect, it } from 'vitest'

import {
  getMessagesToRecipientUserId,
  isMessagesNewRoute,
  resolveMessagesNewCancelTarget,
  stripLegacyMessagesCampaignsModeSearch,
} from './messages-workspace-routing.lib'

describe('getMessagesToRecipientUserId', () => {
  it('reads the draft recipient user id from search params', () => {
    expect(getMessagesToRecipientUserId('?to=user_2&campaignId=camp_1')).toBe('user_2')
    expect(getMessagesToRecipientUserId('')).toBeUndefined()
  })
})

describe('isMessagesNewRoute', () => {
  it('detects the new-message child route', () => {
    expect(isMessagesNewRoute('/messages/new')).toBe(true)
    expect(isMessagesNewRoute('/app/messages/new')).toBe(true)
  })

  it('does not treat the list or thread routes as new', () => {
    expect(isMessagesNewRoute('/messages')).toBe(false)
    expect(isMessagesNewRoute('/messages/conv_1')).toBe(false)
    expect(isMessagesNewRoute('/app/messages')).toBe(false)
  })
})

describe('stripLegacyMessagesCampaignsModeSearch', () => {
  it('returns null when legacy mode is absent', () => {
    expect(stripLegacyMessagesCampaignsModeSearch('')).toBeNull()
    expect(stripLegacyMessagesCampaignsModeSearch('?campaignId=camp_1')).toBeNull()
  })

  it('strips legacy campaigns mode while preserving other query params', () => {
    expect(stripLegacyMessagesCampaignsModeSearch('?mode=campaigns')).toBe('')
    expect(stripLegacyMessagesCampaignsModeSearch('?mode=campaigns&campaignId=camp_1')).toBe(
      '?campaignId=camp_1',
    )
  })
})

describe('resolveMessagesNewCancelTarget', () => {
  it('returns the prior conversation when from is present', () => {
    expect(
      resolveMessagesNewCancelTarget({
        fromConversationId: 'conv_1',
        campaignId: 'camp_1',
      }),
    ).toBe('/messages/conv_1?campaignId=camp_1')
  })

  it('returns the scoped list when only campaignId is present', () => {
    expect(resolveMessagesNewCancelTarget({ campaignId: 'camp_1' })).toBe(
      '/messages?campaignId=camp_1',
    )
  })

  it('returns the global list when no context is present', () => {
    expect(resolveMessagesNewCancelTarget({})).toBe('/messages')
  })
})
