import { describe, expect, it } from 'vitest'

import type { ContentViewer } from '@rpg/contracts'

import { overlayFailureOverviewRows } from '../list/create-content-list'
import { filterCatalogRowsForViewer } from './filter-catalog-rows-for-viewer'

const manageViewer: ContentViewer = { kind: 'manage' }
const pcViewer: ContentViewer = { kind: 'pc', characterIds: ['pc-1'] }

describe('filterCatalogRowsForViewer overlay failure rows', () => {
  const healthy = {
    id: 'ok',
    name: 'Healthy',
    status: 'published' as const,
    campaignAccess: {
      available: true,
      visibilityMode: 'all_players' as const,
      participantIds: [],
      unavailableParticipantIds: [],
      effectiveAudience: 'all_players' as const,
    },
  }
  const failure = overlayFailureOverviewRows([
    {
      targetId: 'broken',
      slug: 'broken',
      name: 'Broken',
      code: 'unsupported_overlay_version',
      message: 'bad',
    },
  ])[0]!

  it('shows overlay failures to managers and hides them from players', () => {
    const rows = [healthy, failure]
    expect(filterCatalogRowsForViewer(rows, manageViewer).map((row) => row.id)).toEqual([
      'ok',
      'broken',
    ])
    expect(filterCatalogRowsForViewer(rows, pcViewer).map((row) => row.id)).toEqual(['ok'])
  })
})
