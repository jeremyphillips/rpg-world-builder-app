import { describe, expect, it } from 'vitest'

import {
  resolveCampaignOverviewMemberOnboardingState,
  resolveCampaignViewerParticipation,
} from './resolve-participation'

describe('resolveCampaignViewerParticipation', () => {
  it('returns none when the viewer has no membership', () => {
    expect(
      resolveCampaignViewerParticipation({
        role: null,
        controlledCharacterIds: [],
        openParticipatingCharacterIds: [],
      }),
    ).toBe('none')
  })

  it('returns staff for owner and co-owner roles', () => {
    expect(
      resolveCampaignViewerParticipation({
        role: 'owner',
        controlledCharacterIds: [],
        openParticipatingCharacterIds: [],
      }),
    ).toBe('staff')

    expect(
      resolveCampaignViewerParticipation({
        role: 'co-owner',
        controlledCharacterIds: ['char_1'],
        openParticipatingCharacterIds: ['char_1'],
      }),
    ).toBe('staff')
  })

  it('returns observer for observer membership', () => {
    expect(
      resolveCampaignViewerParticipation({
        role: 'observer',
        controlledCharacterIds: [],
        openParticipatingCharacterIds: [],
      }),
    ).toBe('observer')
  })

  it('returns onboarding_incomplete for pc with empty control and open participation', () => {
    expect(
      resolveCampaignViewerParticipation({
        role: 'pc',
        controlledCharacterIds: [],
        openParticipatingCharacterIds: [],
      }),
    ).toBe('onboarding_incomplete')
  })

  it('returns active when control intersects open participation', () => {
    expect(
      resolveCampaignViewerParticipation({
        role: 'pc',
        controlledCharacterIds: ['char_1', 'char_2'],
        openParticipatingCharacterIds: ['char_2', 'char_3'],
      }),
    ).toBe('active')
  })

  it('returns invalid for control without matching open participation', () => {
    expect(
      resolveCampaignViewerParticipation({
        role: 'pc',
        controlledCharacterIds: ['char_1'],
        openParticipatingCharacterIds: [],
      }),
    ).toBe('invalid')
  })

  it('returns invalid for viewer-relevant open participation without control', () => {
    expect(
      resolveCampaignViewerParticipation({
        role: 'pc',
        controlledCharacterIds: [],
        openParticipatingCharacterIds: ['char_1'],
      }),
    ).toBe('invalid')
  })

  it('returns invalid for mismatched control and open participation', () => {
    expect(
      resolveCampaignViewerParticipation({
        role: 'pc',
        controlledCharacterIds: ['char_1'],
        openParticipatingCharacterIds: ['char_2'],
      }),
    ).toBe('invalid')
  })
})

describe('resolveCampaignOverviewMemberOnboardingState', () => {
  it('maps active and onboarding_incomplete to overview labels', () => {
    expect(resolveCampaignOverviewMemberOnboardingState('active')).toBe('character_added')
    expect(resolveCampaignOverviewMemberOnboardingState('onboarding_incomplete')).toBe(
      'onboarding_incomplete',
    )
  })

  it('returns undefined for non-overview states', () => {
    expect(resolveCampaignOverviewMemberOnboardingState('staff')).toBeUndefined()
    expect(resolveCampaignOverviewMemberOnboardingState('invalid')).toBeUndefined()
  })
})
