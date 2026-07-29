import { describe, expect, it } from 'vitest'

import { CAMPAIGN_ROLES } from '../../shared/roles'
import { isCampaignManager } from './is-campaign-manager'

describe('isCampaignManager', () => {
  it.each(['owner', 'co-owner'] as const)('returns true for %s', (role) => {
    expect(isCampaignManager(role)).toBe(true)
  })

  it.each(['pc', 'observer'] as const)('returns false for %s', (role) => {
    expect(isCampaignManager(role)).toBe(false)
  })

  it('covers every campaign role', () => {
    for (const role of CAMPAIGN_ROLES) {
      expect(typeof isCampaignManager(role)).toBe('boolean')
    }
  })
})
