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

const failure = {
  targetId: 'srd-cc-5.2.1:broken',
  slug: 'broken',
  name: 'Broken',
  code: 'overlay_validation' as const,
  message: 'Stored system overlay is invalid.',
}

describe('filterOverlayFailuresForListViewer', () => {
  it('returns an empty list for play mode', async () => {
    await expect(
      filterOverlayFailuresForListViewer('camp-1', 'spells', [failure], {
        mode: 'play',
        membership: pcMembership,
        playActor: { kind: 'new_pc' },
      }),
    ).resolves.toEqual([])
  })

  it('returns dm_only failures for owners but not for players', async () => {
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
})
