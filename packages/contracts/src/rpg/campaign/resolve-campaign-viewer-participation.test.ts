import { describe, expect, it } from 'vitest'

import {
  filterViewerOpenParticipatingCharacterIds,
  resolveCampaignOverviewMemberOnboardingState,
  resolveCampaignViewerParticipation,
  resolveCampaignViewerState,
} from './resolve-campaign-viewer-participation'

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

describe('filterViewerOpenParticipatingCharacterIds', () => {
  it('keeps controlled and user-owned open participations only', () => {
    expect(
      filterViewerOpenParticipatingCharacterIds({
        controlledCharacterIds: ['char_controlled'],
        openParticipatingCharacterIds: ['char_controlled', 'char_owned', 'char_other'],
        userCharacterIds: ['char_owned'],
      }),
    ).toEqual(['char_controlled', 'char_owned'])
  })

  it('returns empty when another player open participation is not viewer-relevant', () => {
    expect(
      filterViewerOpenParticipatingCharacterIds({
        controlledCharacterIds: [],
        openParticipatingCharacterIds: ['char_other_pc'],
        userCharacterIds: [],
      }),
    ).toEqual([])
  })
})

describe('resolveCampaignViewerState', () => {
  it('returns onboarding_incomplete for fresh PC membership with no viewer-relevant open roster', () => {
    expect(
      resolveCampaignViewerState({
        role: 'pc',
        controlledCharacterIds: [],
        openParticipatingCharacterIds: [],
      }),
    ).toEqual({
      viewerState: { kind: 'onboarding_incomplete' },
      recoveryReason: 'no_controlled_character',
    })
  })

  it('returns ready for active PC control', () => {
    expect(
      resolveCampaignViewerState({
        role: 'pc',
        controlledCharacterIds: ['char_1'],
        openParticipatingCharacterIds: ['char_1'],
      }),
    ).toEqual({ viewerState: { kind: 'ready' } })
  })

  it('returns control_stale when controlled characters lack open participation', () => {
    expect(
      resolveCampaignViewerState({
        role: 'pc',
        controlledCharacterIds: ['char_1'],
        openParticipatingCharacterIds: [],
      }),
    ).toEqual({
      viewerState: { kind: 'control_stale', characterId: 'char_1' },
      recoveryReason: 'controlled_character_without_open_participation',
    })
  })

  it('returns participation_missing for viewer-owned open participation without control', () => {
    expect(
      resolveCampaignViewerState({
        role: 'pc',
        controlledCharacterIds: [],
        openParticipatingCharacterIds: ['char_1'],
      }),
    ).toEqual({
      viewerState: { kind: 'participation_missing', characterId: 'char_1' },
      recoveryReason: 'open_participation_without_control',
    })
  })

  it('prefers control_stale over participation_missing when both apply', () => {
    expect(
      resolveCampaignViewerState({
        role: 'pc',
        controlledCharacterIds: ['char_1'],
        openParticipatingCharacterIds: ['char_2'],
      }),
    ).toEqual({
      viewerState: { kind: 'control_stale', characterId: 'char_1' },
      recoveryReason: 'controlled_character_without_open_participation',
    })
  })

  it('returns ready for staff and observer roles', () => {
    expect(
      resolveCampaignViewerState({
        role: 'owner',
        controlledCharacterIds: [],
        openParticipatingCharacterIds: [],
      }),
    ).toEqual({ viewerState: { kind: 'ready' } })
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
