import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { describe, expect, it } from 'vitest'

import { resolveReadSurfaceCampaignAccess } from './resolve-read-surface-campaign-access'

describe('resolveReadSurfaceCampaignAccess', () => {
  it('returns stored access when present', () => {
    const stored = {
      ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
      visibilityMode: 'specific_players' as const,
      participantIds: ['pc-1'],
      unavailableParticipantIds: [],
      effectiveAudience: 'specific_players' as const,
    }

    expect(resolveReadSurfaceCampaignAccess('classes', stored)).toBe(stored)
  })

  it('falls back to type defaults for monsters (dm only)', () => {
    expect(resolveReadSurfaceCampaignAccess('monsters', undefined)).toMatchObject({
      visibilityMode: 'dm_only',
      effectiveAudience: 'dm_only',
    })
  })

  it('falls back to all players for classes without stored overlay', () => {
    expect(resolveReadSurfaceCampaignAccess('classes', undefined)).toMatchObject({
      visibilityMode: 'all_players',
    })
  })
})
