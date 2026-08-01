import { describe, expect, it } from 'vitest'

import {
  isCampaignViewerOnboardingIncomplete,
  isCampaignViewerReconnectRequired,
  isCampaignViewerSelfRecoverable,
  resolveCampaignOnboardingAccess,
} from './resolve-campaign-onboarding-access'
import { resolveCampaignViewerState } from './resolve-campaign-viewer-participation'

describe('resolveCampaignOnboardingAccess', () => {
  it('returns forbidden for staff and observer roles regardless of viewer state', () => {
    expect(
      resolveCampaignOnboardingAccess({
        role: 'owner',
        viewerState: { kind: 'ready' },
        activeCharacterIds: [],
      }),
    ).toEqual({ kind: 'forbidden', reason: 'not_player' })

    expect(
      resolveCampaignOnboardingAccess({
        role: 'co-owner',
        viewerState: { kind: 'onboarding_incomplete' },
        activeCharacterIds: [],
      }),
    ).toEqual({ kind: 'forbidden', reason: 'not_player' })

    expect(
      resolveCampaignOnboardingAccess({
        role: 'observer',
        viewerState: { kind: 'ready' },
        activeCharacterIds: [],
      }),
    ).toEqual({ kind: 'forbidden', reason: 'not_player' })
  })

  it('returns forbidden for membership_invalid viewer state', () => {
    expect(
      resolveCampaignOnboardingAccess({
        role: 'pc',
        viewerState: { kind: 'membership_invalid' },
        activeCharacterIds: [],
      }),
    ).toEqual({ kind: 'forbidden', reason: 'membership_invalid' })
  })

  it('returns complete with active character id for PC ready state', () => {
    expect(
      resolveCampaignOnboardingAccess({
        role: 'pc',
        viewerState: { kind: 'ready' },
        activeCharacterIds: ['char_active', 'char_other'],
      }),
    ).toEqual({ kind: 'complete', characterId: 'char_active' })
  })

  it('returns integrity_error when PC ready has no active character ids', () => {
    const result = resolveCampaignOnboardingAccess({
      role: 'pc',
      viewerState: { kind: 'ready' },
      activeCharacterIds: [],
    })

    expect(result).toEqual({
      kind: 'integrity_error',
      reason: 'ready_pc_without_active_character',
    })
  })

  it('returns eligible initial for onboarding_incomplete viewer state', () => {
    expect(
      resolveCampaignOnboardingAccess({
        role: 'pc',
        viewerState: { kind: 'onboarding_incomplete' },
        activeCharacterIds: [],
      }),
    ).toEqual({ kind: 'eligible', mode: 'initial' })
  })

  it('returns eligible reconnect with stale controlled character id for control_stale', () => {
    expect(
      resolveCampaignOnboardingAccess({
        role: 'pc',
        viewerState: { kind: 'control_stale', characterId: 'char_stale_controlled' },
        activeCharacterIds: [],
      }),
    ).toEqual({
      kind: 'eligible',
      mode: 'reconnect',
      characterId: 'char_stale_controlled',
    })
  })

  it('returns eligible reconnect with open unowned character id for participation_missing', () => {
    expect(
      resolveCampaignOnboardingAccess({
        role: 'pc',
        viewerState: { kind: 'participation_missing', characterId: 'char_open_unowned' },
        activeCharacterIds: [],
      }),
    ).toEqual({
      kind: 'eligible',
      mode: 'reconnect',
      characterId: 'char_open_unowned',
    })
  })
})

describe('resolveCampaignOnboardingAccess reconnect identity', () => {
  it('uses the stale controlled character for control_stale', () => {
    const { viewerState } = resolveCampaignViewerState({
      role: 'pc',
      controlledCharacterIds: ['char_stale'],
      openParticipatingCharacterIds: [],
    })

    expect(viewerState).toEqual({ kind: 'control_stale', characterId: 'char_stale' })
    expect(
      resolveCampaignOnboardingAccess({
        role: 'pc',
        viewerState,
        activeCharacterIds: [],
      }),
    ).toEqual({
      kind: 'eligible',
      mode: 'reconnect',
      characterId: 'char_stale',
    })
  })

  it('uses the open unowned participation character for participation_missing', () => {
    const { viewerState } = resolveCampaignViewerState({
      role: 'pc',
      controlledCharacterIds: [],
      openParticipatingCharacterIds: ['char_open'],
    })

    expect(viewerState).toEqual({ kind: 'participation_missing', characterId: 'char_open' })
    expect(
      resolveCampaignOnboardingAccess({
        role: 'pc',
        viewerState,
        activeCharacterIds: [],
      }),
    ).toEqual({
      kind: 'eligible',
      mode: 'reconnect',
      characterId: 'char_open',
    })
  })
})

describe('campaign viewer capability helpers', () => {
  it('identifies self-recoverable viewer states', () => {
    expect(isCampaignViewerSelfRecoverable({ kind: 'onboarding_incomplete' })).toBe(true)
    expect(isCampaignViewerSelfRecoverable({ kind: 'control_stale', characterId: 'char_1' })).toBe(
      true,
    )
    expect(
      isCampaignViewerSelfRecoverable({ kind: 'participation_missing', characterId: 'char_1' }),
    ).toBe(true)
    expect(isCampaignViewerSelfRecoverable({ kind: 'ready' })).toBe(false)
    expect(isCampaignViewerSelfRecoverable({ kind: 'membership_invalid' })).toBe(false)
  })

  it('identifies reconnect-required viewer states', () => {
    expect(
      isCampaignViewerReconnectRequired({ kind: 'control_stale', characterId: 'char_1' }),
    ).toBe(true)
    expect(
      isCampaignViewerReconnectRequired({ kind: 'participation_missing', characterId: 'char_1' }),
    ).toBe(true)
    expect(isCampaignViewerReconnectRequired({ kind: 'onboarding_incomplete' })).toBe(false)
  })

  it('identifies onboarding-incomplete viewer state', () => {
    expect(isCampaignViewerOnboardingIncomplete({ kind: 'onboarding_incomplete' })).toBe(true)
    expect(
      isCampaignViewerOnboardingIncomplete({ kind: 'control_stale', characterId: 'char_1' }),
    ).toBe(false)
  })
})
