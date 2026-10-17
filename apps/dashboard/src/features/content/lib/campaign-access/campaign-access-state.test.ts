import { describe, expect, it } from 'vitest'

import {
  campaignAccessPatchRegistrationKey,
  campaignAccessPatchesEqual,
  campaignAccessResolvedBaselineKey,
  resolvedToCampaignAccessPatch,
} from './campaign-access-state'

describe('campaignAccessPatchesEqual', () => {
  it('treats structurally equal patches as equal despite different object identity', () => {
    const left = { available: true, visibilityMode: 'all_players' as const, participantIds: ['a'] }
    const right = { available: true, visibilityMode: 'all_players' as const, participantIds: ['a'] }
    expect(left).not.toBe(right)
    expect(campaignAccessPatchesEqual(left, right)).toBe(true)
    expect(campaignAccessPatchRegistrationKey(left)).toBe(campaignAccessPatchRegistrationKey(right))
  })
})

describe('campaignAccessResolvedBaselineKey', () => {
  it('matches patch keys for equivalent resolved access objects', () => {
    const left = {
      available: true,
      visibilityMode: 'dm_only' as const,
      participantIds: ['p1'],
      unavailableParticipantIds: ['p2'],
      effectiveAudience: 'dm_only' as const,
    }
    const right = { ...left, participantIds: ['p1'] }
    expect(left).not.toBe(right)
    expect(campaignAccessResolvedBaselineKey(left)).toBe(campaignAccessResolvedBaselineKey(right))
    expect(campaignAccessResolvedBaselineKey(left)).toBe(
      campaignAccessPatchRegistrationKey(resolvedToCampaignAccessPatch(left)),
    )
  })
})
