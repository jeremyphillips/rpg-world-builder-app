import { describe, expect, it, vi } from 'vitest'

import { resolveContentListForCampaignType } from './content-types'
import * as contentService from './content.service'

describe('resolveContentListForCampaignType', () => {
  it('uses kernel list resolution for default registrations', async () => {
    const spy = vi.spyOn(contentService, 'resolveContentListForCampaign').mockResolvedValue({
      items: [{ id: 'feat-1' }],
      overlayFailures: [
        {
          targetId: 'feat-1',
          slug: 'a',
          name: 'A',
          code: 'unsupported_overlay_version',
          message: 'x',
        },
      ],
    })

    const result = await resolveContentListForCampaignType('feats', 'campaign-1')

    expect(result.overlayFailures).toHaveLength(1)
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
