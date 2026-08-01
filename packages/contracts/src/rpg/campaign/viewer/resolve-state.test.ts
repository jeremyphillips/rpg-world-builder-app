import { describe, expect, it } from 'vitest'

import {
  filterViewerOpenParticipatingCharacterIds,
  resolveCampaignViewerState,
} from './resolve-state'

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
