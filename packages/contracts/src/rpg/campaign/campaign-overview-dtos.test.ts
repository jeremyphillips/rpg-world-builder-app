import { describe, expect, it } from 'vitest'

import { campaignOverviewMemberListItemSchema } from './campaign-overview-dtos'

describe('campaign overview DTOs', () => {
  it('parses member list items with onboarding state', () => {
    const parsed = campaignOverviewMemberListItemSchema.parse({
      id: 'member_1',
      displayName: 'Player One',
      role: 'pc',
      onboardingState: 'onboarding_incomplete',
    })

    expect(parsed.onboardingState).toBe('onboarding_incomplete')
  })
})
