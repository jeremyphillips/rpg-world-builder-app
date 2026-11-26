import { describe, expect, it, vi, beforeEach } from 'vitest'

import { resolveSubclassClassListSlice } from './resolve-subclass-class-list-slice'
import * as contentService from '../content.service'
import * as filterModule from '../lib/filter-overlay-failures-for-list-viewer'
import * as campaignModule from '../../campaign'

vi.mock('../content.service')
vi.mock('../lib/filter-overlay-failures-for-list-viewer')
vi.mock('../../campaign')
vi.mock('../lib/content-campaign-access.service', () => ({
  attachCampaignAccessForTargetType: vi.fn(async (_campaignId, _type, items) => items),
}))
vi.mock('../lib/apply-catalog-list-filter', () => ({
  applyCatalogListFilter: vi.fn((items) => items),
}))
vi.mock('../lib/content-type-config', () => ({
  loadSystemContent: vi.fn(() => [
    { id: 'sub-1', classId: 'class-fighter', slug: 'champion', name: 'Champion' },
    { id: 'sub-2', classId: 'class-wizard', slug: 'evoker', name: 'Evoker' },
  ]),
}))

describe('resolveSubclassClassListSlice', () => {
  beforeEach(() => {
    vi.mocked(contentService.resolveContentListForCampaign).mockResolvedValue({
      items: [
        {
          id: 'hb-1',
          classId: 'class-fighter',
          name: 'HB Subclass',
          slug: 'hb-subclass',
        } as never,
      ],
      overlayFailures: [
        {
          targetId: 'sub-1',
          slug: 'champion',
          name: 'Champion',
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

  it('returns summaries and parent-scoped failure counts from one list resolution', async () => {
    const slice = await resolveSubclassClassListSlice('c1', undefined)
    expect(slice.summariesByClassId.get('class-fighter')).toEqual([
      { id: 'hb-1', name: 'HB Subclass' },
    ])
    expect(slice.failureCountByClassId.get('class-fighter')).toBe(1)
    expect(contentService.resolveContentListForCampaign).toHaveBeenCalledTimes(1)
  })

  it('reuses request-scoped subclass list without a second catalog resolve', async () => {
    vi.mocked(contentService.resolveContentListForCampaign).mockClear()
    const resolution = {
      items: [
        {
          id: 'hb-2',
          classId: 'class-wizard',
          name: 'HB Evoker',
          slug: 'hb-evoker',
        } as never,
      ],
      overlayFailures: [] as const,
    }
    const slice = await resolveSubclassClassListSlice('c1', undefined, resolution)
    expect(slice.summariesByClassId.get('class-wizard')).toEqual([
      { id: 'hb-2', name: 'HB Evoker' },
    ])
    expect(contentService.resolveContentListForCampaign).not.toHaveBeenCalled()
  })

  it('throws when campaign is missing while mapping visible overlay failures to parent counts', async () => {
    vi.mocked(campaignModule.findCampaignById).mockResolvedValue(null)
    await expect(resolveSubclassClassListSlice('c1', undefined)).rejects.toThrow(
      /Cannot resolve subclass overlay failure parent counts/,
    )
  })
})
