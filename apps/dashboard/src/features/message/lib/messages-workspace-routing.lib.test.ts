import { describe, expect, it } from 'vitest'

import {
  isMessagesNewRoute,
  stripLegacyMessagesCampaignsModeSearch,
} from './messages-workspace-routing.lib'

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
