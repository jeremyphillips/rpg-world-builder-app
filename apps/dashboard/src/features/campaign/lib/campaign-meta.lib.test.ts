import { describe, expect, it } from 'vitest'

import { DEFAULT_GAME_MASTER_DISPLAY_STYLE } from '@rpg/contracts'

import { makeCampaignListItem } from '@/test/fixtures/campaigns'

import {
  buildCampaignMeta,
  buildCampaignMetaSegments,
  formatCampaignLastOpenedClause,
  formatCampaignMetaPlainText,
} from './campaign-meta.lib'

const gameMasterStyle = DEFAULT_GAME_MASTER_DISPLAY_STYLE

describe('campaign-meta.lib', () => {
  it('builds viewer facet and omits pc count when equal to player count', () => {
    const meta = buildCampaignMeta(
      makeCampaignListItem({
        status: 'draft',
        campaignRole: 'owner',
        playerMemberCount: 1,
        openPcCount: 1,
        lastOpenedByViewerAt: '2020-01-01T12:00:00.000Z',
      }),
      gameMasterStyle,
    )

    expect(meta.viewerFacetLabel).toBe('GM')
    expect(
      formatCampaignMetaPlainText(buildCampaignMetaSegments(meta, { includeRecency: false })),
    ).toBe('GM · Draft · 1 player')
  })

  it('includes pc count when it differs from player member count', () => {
    const meta = buildCampaignMeta(
      makeCampaignListItem({
        status: 'active',
        campaignRole: 'owner',
        playerMemberCount: 4,
        openPcCount: 6,
      }),
      gameMasterStyle,
    )

    expect(
      formatCampaignMetaPlainText(buildCampaignMetaSegments(meta, { includeRecency: false })),
    ).toBe('GM · Active · 4 players · 6 PCs')
  })

  it('includes recency when requested and timestamp is set', () => {
    const now = new Date('2026-09-28T12:00:00.000Z')
    const meta = buildCampaignMeta(
      makeCampaignListItem({
        status: 'draft',
        campaignRole: 'pc',
        playerMemberCount: 1,
        openPcCount: 1,
        lastOpenedByViewerAt: '2026-09-27T12:00:00.000Z',
      }),
      gameMasterStyle,
    )

    expect(
      formatCampaignMetaPlainText(buildCampaignMetaSegments(meta, { includeRecency: true, now })),
    ).toBe('Player · Draft · 1 player · Last opened yesterday')
  })

  it('omits the recency segment when lastOpenedByViewerAt is null', () => {
    const meta = buildCampaignMeta(
      makeCampaignListItem({
        playerMemberCount: 0,
        openPcCount: 0,
        lastOpenedByViewerAt: null,
      }),
      gameMasterStyle,
    )

    expect(
      formatCampaignMetaPlainText(buildCampaignMetaSegments(meta, { includeRecency: true })),
    ).toBe('GM · Active · 0 players')
  })

  it('formats last opened copy from relative recency', () => {
    const now = new Date('2026-09-28T12:00:00.000Z')
    expect(formatCampaignLastOpenedClause('2026-09-27T12:00:00.000Z', now)).toBe(
      'Last opened yesterday',
    )
  })
})
