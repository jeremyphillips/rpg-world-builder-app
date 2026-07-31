import { describe, expect, it } from 'vitest'

import { stripLegacyMessagesCampaignsModeSearch } from './messages-workspace-routing.lib'

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
