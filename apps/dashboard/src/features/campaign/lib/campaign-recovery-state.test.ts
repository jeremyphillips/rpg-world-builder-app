import { describe, expect, it } from 'vitest'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import {
  isCampaignOnboardingIncomplete,
  isCampaignRecoveryRequired,
  resolveCampaignRecoveryState,
} from './campaign-recovery-state'

describe('resolveCampaignRecoveryState', () => {
  it('maps viewer onboarding states to recovery kinds', () => {
    expect(
      resolveCampaignRecoveryState(makeCampaignListItem({ viewerOnboardingState: 'incomplete' })),
    ).toEqual({ kind: 'onboarding_incomplete' })
    expect(
      resolveCampaignRecoveryState(makeCampaignListItem({ viewerOnboardingState: 'invalid' })),
    ).toEqual({ kind: 'participation_invalid' })
    expect(
      resolveCampaignRecoveryState(makeCampaignListItem({ viewerOnboardingState: 'complete' })),
    ).toEqual({ kind: 'ready' })
  })
})

describe('isCampaignRecoveryRequired', () => {
  it('requires recovery for incomplete and invalid memberships', () => {
    expect(isCampaignRecoveryRequired({ kind: 'onboarding_incomplete' })).toBe(true)
    expect(isCampaignRecoveryRequired({ kind: 'participation_invalid' })).toBe(true)
    expect(isCampaignRecoveryRequired({ kind: 'ready' })).toBe(false)
  })

  it('treats only incomplete as onboarding incomplete', () => {
    expect(isCampaignOnboardingIncomplete({ kind: 'onboarding_incomplete' })).toBe(true)
    expect(isCampaignOnboardingIncomplete({ kind: 'participation_invalid' })).toBe(false)
  })
})
