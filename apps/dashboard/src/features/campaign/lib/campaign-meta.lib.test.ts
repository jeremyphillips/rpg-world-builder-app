import { describe, expect, it } from 'vitest'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import {
  buildCampaignMeta,
  formatCampaignLastOpenedClause,
  formatCampaignMetaForSurface,
} from './campaign-meta.lib'

describe('campaign-meta.lib', () => {
  it('omits recency for hero-style surfaces', () => {
    const meta = buildCampaignMeta(
      makeCampaignListItem({
        status: 'draft',
        otherMemberCount: 1,
        openCharacterCount: 1,
        lastOpenedByViewerAt: '2020-01-01T12:00:00.000Z',
      }),
    )

    expect(formatCampaignMetaForSurface(meta, { includeRecency: false })).toBe('Draft · 1 player')
  })

  it('includes recency when the viewer timestamp is set', () => {
    const now = new Date('2026-09-28T12:00:00.000Z')
    const meta = buildCampaignMeta(
      makeCampaignListItem({
        status: 'draft',
        otherMemberCount: 1,
        openCharacterCount: 1,
        lastOpenedByViewerAt: '2026-09-27T12:00:00.000Z',
      }),
    )

    expect(formatCampaignMetaForSurface(meta, { includeRecency: true, now })).toBe(
      'Draft · 1 player · Last opened yesterday',
    )
  })

  it('omits the recency clause when lastOpenedByViewerAt is null', () => {
    const meta = buildCampaignMeta(
      makeCampaignListItem({
        otherMemberCount: 0,
        openCharacterCount: 0,
        lastOpenedByViewerAt: null,
      }),
    )

    expect(formatCampaignMetaForSurface(meta, { includeRecency: true })).toBe('Active · 0 players')
  })

  it('formats last opened copy from relative recency', () => {
    const now = new Date('2026-09-28T12:00:00.000Z')
    expect(formatCampaignLastOpenedClause('2026-09-27T12:00:00.000Z', now)).toBe(
      'Last opened yesterday',
    )
  })
})
