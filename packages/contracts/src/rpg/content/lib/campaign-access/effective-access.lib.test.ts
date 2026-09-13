import { describe, expect, it } from 'vitest'

import type { ResolvedContentCampaignAccess } from './campaign-access'
import {
  isEffectiveAvailable,
  isVisibleToViewer,
  resolveEffectiveCampaignAccess,
  resolveEffectiveSpeciesTraitAccess,
} from './effective-access.lib'

function access(
  partial: Partial<ResolvedContentCampaignAccess> &
    Pick<ResolvedContentCampaignAccess, 'available' | 'visibilityMode'>,
): ResolvedContentCampaignAccess {
  return {
    participantIds: [],
    unavailableParticipantIds: [],
    effectiveAudience: partial.available ? partial.visibilityMode : 'none',
    ...partial,
  }
}

describe('resolveEffectiveCampaignAccess', () => {
  it('returns unavailable when parent is unavailable', () => {
    const parent = access({ available: false, visibilityMode: 'all_players' })
    const effective = resolveEffectiveCampaignAccess(parent, {
      available: true,
      visibilityMode: 'all_players',
      participantIds: [],
    })

    expect(effective.available).toBe(false)
    expect(effective.effectiveAudience).toBe('none')
  })

  it('narrows stored child all_players under parent specific_players without rewriting child', () => {
    const parent = access({
      available: true,
      visibilityMode: 'specific_players',
      participantIds: ['pc-a', 'pc-b'],
    })
    const effective = resolveEffectiveCampaignAccess(parent, {
      available: true,
      visibilityMode: 'all_players',
      participantIds: [],
    })

    expect(effective.visibilityMode).toBe('specific_players')
    expect(effective.participantIds).toEqual(['pc-a', 'pc-b'])
    expect(isEffectiveAvailable(effective)).toBe(true)
  })

  it('intersects participant ids when both parent and child are specific', () => {
    const parent = access({
      available: true,
      visibilityMode: 'specific_players',
      participantIds: ['pc-a', 'pc-b'],
    })
    const effective = resolveEffectiveCampaignAccess(parent, {
      available: true,
      visibilityMode: 'specific_players',
      participantIds: ['pc-b', 'pc-c'],
    })

    expect(effective.participantIds).toEqual(['pc-b'])
  })

  it('narrows to dm_only when parent is dm_only', () => {
    const parent = access({ available: true, visibilityMode: 'dm_only' })
    const effective = resolveEffectiveCampaignAccess(parent, {
      available: true,
      visibilityMode: 'all_players',
      participantIds: [],
    })

    expect(effective.visibilityMode).toBe('dm_only')
  })
})

describe('resolveEffectiveSpeciesTraitAccess', () => {
  it('returns unavailable when trait available is false', () => {
    const speciesAccess = access({ available: true, visibilityMode: 'all_players' })
    const effective = resolveEffectiveSpeciesTraitAccess(speciesAccess, { available: false })

    expect(effective.available).toBe(false)
    expect(effective.effectiveAudience).toBe('none')
  })

  it('inherits species access when trait is available', () => {
    const speciesAccess = access({
      available: true,
      visibilityMode: 'specific_players',
      participantIds: ['pc-a'],
    })
    const effective = resolveEffectiveSpeciesTraitAccess(speciesAccess, { available: true })

    expect(effective).toEqual(speciesAccess)
  })
})

describe('isVisibleToViewer', () => {
  it('delegates to discovery policy separately from resolve', () => {
    const resolved = access({ available: true, visibilityMode: 'all_players' })
    expect(isVisibleToViewer(resolved, { kind: 'manage' })).toBe(true)
    expect(isVisibleToViewer(resolved, { kind: 'none' })).toBe(true)
  })

  it('returns false for unavailable effective access', () => {
    const resolved = access({ available: false, visibilityMode: 'all_players' })
    expect(isVisibleToViewer(resolved, { kind: 'pc', characterIds: ['pc-a'] })).toBe(false)
  })
})
