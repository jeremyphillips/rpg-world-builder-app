import { describe, expect, it } from 'vitest'

import { makeCampaignListItem, VIEWER_STATE } from '@/test/fixtures/campaigns'

import {
  isCampaignMembershipInvalid,
  isCampaignOnboardingIncomplete,
  isCampaignReconnectRequired,
  isCampaignRecoveryRequired,
  isCampaignSelfRecoverable,
  resolveCampaignRecoveryState,
} from './campaign-recovery-state'

describe('resolveCampaignRecoveryState', () => {
  it('maps viewer states to recovery states', () => {
    expect(
      resolveCampaignRecoveryState(
        makeCampaignListItem({ viewerState: VIEWER_STATE.onboardingIncomplete }),
      ),
    ).toEqual({ kind: 'onboarding_incomplete' })

    expect(
      resolveCampaignRecoveryState(
        makeCampaignListItem({ viewerState: VIEWER_STATE.controlStale('char_1') }),
      ),
    ).toEqual({ kind: 'control_stale', characterId: 'char_1' })

    expect(
      resolveCampaignRecoveryState(makeCampaignListItem({ viewerState: VIEWER_STATE.ready })),
    ).toEqual({ kind: 'ready' })
  })
})

describe('recovery predicates', () => {
  it('treats self-recoverable states as recoverable but not membership_invalid', () => {
    expect(isCampaignSelfRecoverable({ kind: 'onboarding_incomplete' })).toBe(true)
    expect(isCampaignSelfRecoverable({ kind: 'control_stale', characterId: 'char_1' })).toBe(true)
    expect(isCampaignSelfRecoverable({ kind: 'membership_invalid' })).toBe(false)
    expect(isCampaignRecoveryRequired({ kind: 'membership_invalid' })).toBe(true)
    expect(isCampaignMembershipInvalid({ kind: 'membership_invalid' })).toBe(true)
    expect(isCampaignReconnectRequired({ kind: 'control_stale', characterId: 'char_1' })).toBe(true)
    expect(
      isCampaignOnboardingIncomplete({ kind: 'participation_missing', characterId: 'char_1' }),
    ).toBe(false)
  })
})
