import { describe, expect, it } from 'vitest'

import { resolveCampaignAccessPlayerAccessHint } from './campaign-access-form-visibility'

describe('resolveCampaignAccessPlayerAccessHint', () => {
  it('returns preserved hint when availability is off', () => {
    expect(resolveCampaignAccessPlayerAccessHint({ available: false })).toBe(
      'This setting is saved and will be restored if availability is turned back on.',
    )
  })

  it('returns player-access hint when availability is on', () => {
    expect(resolveCampaignAccessPlayerAccessHint({ available: true })).toBe(
      'Controls which players can discover and select this content while it is available.',
    )
  })
})
