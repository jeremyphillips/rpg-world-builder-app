import { describe, expect, it } from 'vitest'

import {
  DEFAULT_CONTENT_CAMPAIGN_ACCESS,
  type ContentViewer,
  type ResolvedContentCampaignAccess,
} from '@rpg/contracts'

import { filterCatalogRowsForViewer } from './filter-catalog-rows-for-viewer'

const manageViewer: ContentViewer = { kind: 'manage' }
const pcViewer: ContentViewer = { kind: 'pc', characterIds: ['pc-1'] }

function access(
  overrides: Partial<ResolvedContentCampaignAccess> = {},
): ResolvedContentCampaignAccess {
  return { ...DEFAULT_CONTENT_CAMPAIGN_ACCESS, ...overrides }
}

describe('filterCatalogRowsForViewer', () => {
  const rows = [
    { id: 'a', status: 'published', campaignAccess: access() },
    { id: 'b', status: 'draft', campaignAccess: access() },
    { id: 'c', status: 'published', campaignAccess: access({ visibilityMode: 'dm_only' }) },
    {
      id: 'd',
      status: 'published',
      campaignAccess: access({
        visibilityMode: 'specific_players',
        participantIds: ['pc-1'],
      }),
    },
  ]

  it('hides drafts and restricted rows for players', () => {
    expect(filterCatalogRowsForViewer(rows, pcViewer).map((row) => row.id)).toEqual(['a', 'd'])
  })

  it('shows all rows for managers including drafts and restricted access', () => {
    expect(filterCatalogRowsForViewer(rows, manageViewer).map((row) => row.id)).toEqual([
      'a',
      'b',
      'c',
      'd',
    ])
  })
})
