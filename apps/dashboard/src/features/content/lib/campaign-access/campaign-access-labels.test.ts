import { describe, expect, it } from 'vitest'

import {
  formatCampaignAccessAvailabilityToast,
  formatCampaignAccessNoLongerAvailableMessage,
  formatCampaignAccessNowAvailableMessage,
} from './campaign-access-labels'

describe('formatCampaignAccessAvailabilityToast', () => {
  it('uses quoted name for a single named item', () => {
    expect(
      formatCampaignAccessAvailabilityToast({ count: 1, name: 'Fireball', available: true }),
    ).toBe('"Fireball" is now available in this campaign.')
    expect(
      formatCampaignAccessAvailabilityToast({ count: 1, name: 'Fireball', available: false }),
    ).toBe('"Fireball" is no longer available in this campaign.')
  })

  it('uses count copy for one item without a name', () => {
    expect(formatCampaignAccessAvailabilityToast({ count: 1, available: true })).toBe(
      '1 item is now available in this campaign.',
    )
  })

  it('uses plural count copy for multiple items', () => {
    expect(formatCampaignAccessAvailabilityToast({ count: 2, available: true })).toBe(
      '2 items are now available in this campaign.',
    )
    expect(formatCampaignAccessAvailabilityToast({ count: 2, available: false })).toBe(
      '2 items are no longer available in this campaign.',
    )
  })

  it('delegates row-toggle helpers to the shared formatter', () => {
    expect(formatCampaignAccessNowAvailableMessage('Fireball')).toBe(
      '"Fireball" is now available in this campaign.',
    )
    expect(formatCampaignAccessNoLongerAvailableMessage('Fireball')).toBe(
      '"Fireball" is no longer available in this campaign.',
    )
  })
})
