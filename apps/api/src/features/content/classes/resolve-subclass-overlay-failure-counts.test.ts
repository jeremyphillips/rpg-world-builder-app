import { describe, expect, it, vi, beforeEach } from 'vitest'

import { resolveSubclassOverlayFailureCountByClassId } from './resolve-subclass-overlay-failure-counts'
import * as contentService from '../content.service'
import * as filterModule from '../lib/filter-overlay-failures-for-list-viewer'
import * as campaignModule from '../../campaign'

vi.mock('../content.service')
vi.mock('../lib/filter-overlay-failures-for-list-viewer')
vi.mock('../../campaign')
vi.mock('../lib/content-type-config', () => ({
  loadSystemContent: vi.fn(() => [
    { id: 'sub-1', classId: 'class-fighter', slug: 'champion', name: 'Champion' },
    { id: 'sub-2', classId: 'class-wizard', slug: 'evoker', name: 'Evoker' },
  ]),
}))

describe('resolveSubclassOverlayFailureCountByClassId', () => {
  beforeEach(() => {
    vi.mocked(contentService.resolveContentListForCampaign).mockResolvedValue({
      items: [],
      overlayFailures: [
        {
          targetId: 'sub-1',
          slug: 'champion',
          name: 'Champion',
          code: 'unsupported_overlay_version',
          message: 'bad',
        },
        {
          targetId: 'sub-2',
          slug: 'evoker',
          name: 'Evoker',
          code: 'unsupported_overlay_version',
          message: 'bad',
        },
      ],
    })
    vi.mocked(filterModule.filterOverlayFailuresForListViewer).mockImplementation(
      async (_campaignId, _type, failures) => [...failures],
    )
    vi.mocked(campaignModule.findCampaignById).mockResolvedValue({
      id: 'c1',
      rulesetId: 'srd-cc-5.2.1',
    } as never)
  })

  it('groups viewer-visible failures by parent class id', async () => {
    const counts = await resolveSubclassOverlayFailureCountByClassId('c1', undefined)
    expect(counts.get('class-fighter')).toBe(1)
    expect(counts.get('class-wizard')).toBe(1)
  })
})
