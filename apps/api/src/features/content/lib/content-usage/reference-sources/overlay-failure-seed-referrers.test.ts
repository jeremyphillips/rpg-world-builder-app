import { describe, expect, it, vi } from 'vitest'

import { monstersRegistration } from '../../../monsters/monsters.config'
import { resolveCatalogRowsWithOverlayFailureSeeds } from './overlay-failure-seed-referrers'

vi.mock('../../../../campaign', () => ({
  findCampaignById: vi.fn(),
}))

vi.mock('../../../content.service', () => ({
  resolveContentListForCampaign: vi.fn(),
}))

import { findCampaignById } from '../../../../campaign'
import { resolveContentListForCampaign } from '../../../content.service'

describe('resolveCatalogRowsWithOverlayFailureSeeds', () => {
  it('fails closed when overlay failures exist but campaign context is missing', async () => {
    vi.mocked(resolveContentListForCampaign).mockResolvedValue({
      items: [],
      overlayFailures: [
        {
          targetId: 'srd:monster',
          slug: 'monster',
          name: 'Monster',
          code: 'overlay_validation',
          message: 'bad',
        },
      ],
    })
    vi.mocked(findCampaignById).mockResolvedValue(null)

    await expect(
      resolveCatalogRowsWithOverlayFailureSeeds(monstersRegistration.read, 'camp-1'),
    ).rejects.toThrow(/campaign camp-1 was not found/)
  })
})
