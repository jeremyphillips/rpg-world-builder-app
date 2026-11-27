import { describe, expect, it } from 'vitest'

import {
  CONTENT_OVERLAY_FAILURE_ROW_CAMPAIGN_ACCESS,
  isContentOverlayFailureOverviewRow,
  overlayFailureOverviewStatusLabel,
} from './content-overlay-overview.lib'
import { mergeContentListOverviewRows } from './create-content-list'

describe('content overlay overview rows', () => {
  const failure = {
    targetId: 'srd:broken',
    slug: 'broken',
    name: 'Broken Feat',
    code: 'unsupported_overlay_version' as const,
    message: 'Stored system overlay is unsupported.',
  }

  it('merges failure rows after resolved items for overview tables', () => {
    const merged = mergeContentListOverviewRows([{ id: 'healthy', name: 'Healthy' }], [failure])
    expect(merged).toHaveLength(2)
    expect(isContentOverlayFailureOverviewRow(merged[1])).toBe(true)
    expect(overlayFailureOverviewStatusLabel(merged[1])).toBe('Overlay unresolved')
    expect(merged[1]?.campaignAccess).toEqual(CONTENT_OVERLAY_FAILURE_ROW_CAMPAIGN_ACCESS)
  })

  it('returns only items when overlayFailures is empty', () => {
    const merged = mergeContentListOverviewRows([{ id: 'a' }], [])
    expect(merged).toEqual([{ id: 'a' }])
  })
})
