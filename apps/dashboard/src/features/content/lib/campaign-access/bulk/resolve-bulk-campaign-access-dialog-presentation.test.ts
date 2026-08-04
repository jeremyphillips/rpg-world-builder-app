import { describe, expect, it } from 'vitest'

import { createBulkCampaignAccessDescriptor } from '../campaign-access-labels'
import { resolveBulkCampaignAccessDialogPresentation } from './resolve-bulk-campaign-access-dialog-presentation'
import type { BulkCampaignAccessPreview } from './resolve-bulk-campaign-access-preview'

const descriptor = createBulkCampaignAccessDescriptor('spells')

function createPreview(
  overrides: Partial<BulkCampaignAccessPreview> = {},
): BulkCampaignAccessPreview {
  return {
    selectedCount: 2,
    wouldChangeCount: 1,
    unchangedCount: 1,
    hasChanges: true,
    plan: { targets: [] },
    unchangedReasons: [],
    ...overrides,
  }
}

describe('resolveBulkCampaignAccessDialogPresentation', () => {
  it('returns configure copy when not in resolve phase', () => {
    const presentation = resolveBulkCampaignAccessDialogPresentation({
      blockedCount: 0,
      blockedSourceKeys: [],
      confirmedCount: 0,
      descriptor,
      hasBlockers: false,
      isResolvePhase: false,
      itemLabelPlural: 'spells',
      preview: createPreview(),
      selectedCount: 2,
    })

    expect(presentation.useCustomResolveHeadline).toBe(false)
    expect(presentation.description).toContain('2')
    expect(presentation.configureApplyHidden).toBe(false)
  })

  it('returns blocked resolve copy when blockers remain', () => {
    const presentation = resolveBulkCampaignAccessDialogPresentation({
      blockedCount: 1,
      blockedSourceKeys: ['character_usage'],
      confirmedCount: 0,
      descriptor,
      hasBlockers: true,
      isResolvePhase: true,
      itemLabelPlural: 'spells',
      preview: createPreview(),
      selectedCount: 2,
    })

    expect(presentation.useCustomResolveHeadline).toBe(true)
    expect(presentation.resolveApplyHidden).toBe(true)
    expect(presentation.resolutionLegend).toContain('Blocked')
  })
})
