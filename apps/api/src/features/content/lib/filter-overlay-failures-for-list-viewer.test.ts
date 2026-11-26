import { DEFAULT_CONTENT_CAMPAIGN_ACCESS } from '@rpg/contracts'
import { describe, expect, it, vi } from 'vitest'

import { filterOverlayFailuresForListViewer } from './filter-overlay-failures-for-list-viewer'

vi.mock('./content-campaign-access.service', () => ({
  attachCampaignAccessForTargetType: vi.fn(
    async <T extends { id: string }>(
      _campaignId: string,
      _targetType: string,
      rows: T[],
    ): Promise<Array<T & { campaignAccess: typeof DEFAULT_CONTENT_CAMPAIGN_ACCESS }>> =>
      rows.map((row) => ({ ...row, campaignAccess: DEFAULT_CONTENT_CAMPAIGN_ACCESS })),
  ),
}))

const ownerMembership = {
  campaignId: 'camp-1',
  userId: 'owner',
  campaignRole: 'owner' as const,
  controlledCharacterIds: [] as string[],
  pcCharacterIds: [] as string[],
}

const pcMembership = {
  ...ownerMembership,
  campaignRole: 'pc' as const,
  pcCharacterIds: ['pc-1'],
}

const dualPcMembership = {
  ...pcMembership,
  pcCharacterIds: ['pc-a', 'pc-b'],
}

const failure = {
  targetId: 'srd-cc-5.2.1:broken',
  slug: 'broken',
  name: 'Broken',
  code: 'overlay_validation' as const,
  message: 'Stored system overlay is invalid.',
}

describe('filterOverlayFailuresForListViewer', () => {
  it('returns an empty list for play mode regardless of actor eligibility', async () => {
    await expect(
      filterOverlayFailuresForListViewer('camp-1', 'spells', [failure], {
        mode: 'play',
        membership: pcMembership,
        playActor: { kind: 'new_pc' },
      }),
    ).resolves.toEqual([])

    await expect(
      filterOverlayFailuresForListViewer('camp-1', 'spells', [failure], {
        mode: 'play',
        membership: ownerMembership,
        playActor: { kind: 'npc' },
      }),
    ).resolves.toEqual([])
  })

  it('returns dm_only failures for owners but not for players in discovery mode', async () => {
    const { attachCampaignAccessForTargetType } = await import('./content-campaign-access.service')
    vi.mocked(attachCampaignAccessForTargetType).mockImplementation(async (_c, _t, rows) =>
      rows.map((row) => ({
        ...row,
        campaignAccess: {
          ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
          visibilityMode: 'dm_only' as const,
        },
      })),
    )

    await expect(
      filterOverlayFailuresForListViewer('camp-1', 'spells', [failure], {
        mode: 'discovery',
        membership: ownerMembership,
      }),
    ).resolves.toEqual([failure])

    await expect(
      filterOverlayFailuresForListViewer('camp-1', 'spells', [failure], {
        mode: 'discovery',
        membership: pcMembership,
      }),
    ).resolves.toEqual([])
  })

  it('keeps unavailable failures for players in reference mode but hides dm_only failures', async () => {
    const { attachCampaignAccessForTargetType } = await import('./content-campaign-access.service')
    const unavailable = {
      ...failure,
      targetId: 'srd-cc-5.2.1:unavailable',
      slug: 'unavailable',
    }
    const dmOnly = {
      ...failure,
      targetId: 'srd-cc-5.2.1:dm-only',
      slug: 'dm-only',
    }
    vi.mocked(attachCampaignAccessForTargetType).mockImplementation(async (_c, _t, rows) =>
      rows.map((row) => {
        if (row.id.includes('unavailable')) {
          return {
            ...row,
            campaignAccess: {
              ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
              available: false,
              effectiveAudience: 'none' as const,
            },
          }
        }
        return {
          ...row,
          campaignAccess: {
            ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
            visibilityMode: 'dm_only' as const,
          },
        }
      }),
    )

    await expect(
      filterOverlayFailuresForListViewer('camp-1', 'spells', [unavailable, dmOnly], {
        mode: 'reference',
        membership: pcMembership,
      }),
    ).resolves.toEqual([unavailable])

    await expect(
      filterOverlayFailuresForListViewer('camp-1', 'spells', [unavailable, dmOnly], {
        mode: 'reference',
        membership: ownerMembership,
      }),
    ).resolves.toEqual([unavailable, dmOnly])
  })

  it('scopes specific_players failure discovery to granted play actors', async () => {
    const { attachCampaignAccessForTargetType } = await import('./content-campaign-access.service')
    const restricted = {
      ...failure,
      targetId: 'srd-cc-5.2.1:restricted',
      slug: 'restricted',
    }
    vi.mocked(attachCampaignAccessForTargetType).mockImplementation(async (_c, _t, rows) =>
      rows.map((row) => ({
        ...row,
        campaignAccess: {
          ...DEFAULT_CONTENT_CAMPAIGN_ACCESS,
          visibilityMode: 'specific_players' as const,
          participantIds: ['pc-a'],
        },
      })),
    )

    await expect(
      filterOverlayFailuresForListViewer('camp-1', 'spells', [restricted], {
        mode: 'discovery',
        membership: { ...dualPcMembership, playActorCharacterId: 'pc-a' },
      }),
    ).resolves.toEqual([restricted])

    await expect(
      filterOverlayFailuresForListViewer('camp-1', 'spells', [restricted], {
        mode: 'discovery',
        membership: { ...dualPcMembership, playActorCharacterId: 'pc-b' },
      }),
    ).resolves.toEqual([])
  })
})
