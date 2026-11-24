import { describe, expect, it } from 'vitest'

import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'

import {
  isCampaignOnboardingIncomplete,
  resolveCampaignRecoveryState,
} from './campaign-membership-onboarding'

describe('isCampaignOnboardingIncomplete', () => {
  it('returns true when viewerState is onboarding_incomplete', () => {
    expect(
      isCampaignOnboardingIncomplete(
        resolveCampaignRecoveryState(
          makeCampaignListItem({ viewerState: VIEWER_STATE.onboardingIncomplete }),
        ),
      ),
    ).toBe(true)
  })

  it('returns false for complete, invalid, and staff onboarding states', () => {
    expect(
      isCampaignOnboardingIncomplete(
        resolveCampaignRecoveryState(makeCampaignListItem({ viewerState: VIEWER_STATE.ready })),
      ),
    ).toBe(false)
    expect(
      isCampaignOnboardingIncomplete(
        resolveCampaignRecoveryState(
          makeCampaignListItem({ viewerState: VIEWER_STATE.controlStale('char_1') }),
        ),
      ),
    ).toBe(false)
    expect(
      isCampaignOnboardingIncomplete(
        resolveCampaignRecoveryState(
          makeCampaignListItem({ campaignRole: 'owner', viewerState: VIEWER_STATE.ready }),
        ),
      ),
    ).toBe(false)
  })
})
