import { describe, expect, it } from 'vitest'

import { resolveCampaignAccessPlayerAccessHint } from './campaign-access-form-visibility'

describe('resolveCampaignAccessPlayerAccessHint', () => {
  it('returns preserved hint when availability is off', () => {
    expect(resolveCampaignAccessPlayerAccessHint({ available: false })).toBe(
      'This setting is saved and will be restored if availability is turned back on.',
    )
  })

  it('returns specific-players disabled hint when targeting is unavailable', () => {
    expect(resolveCampaignAccessPlayerAccessHint({ available: true })).toBe(
      'Set up campaign players before choosing specific players.',
    )
  })
})
