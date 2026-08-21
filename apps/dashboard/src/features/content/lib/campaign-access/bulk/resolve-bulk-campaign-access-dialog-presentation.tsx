import type { ReactNode } from 'react'
import type { UsageBlockerSourceKey } from '@rpg/contracts'

import type { BulkActionDescriptor } from '@/lib/actions'

import {
  BULK_CAMPAIGN_ACCESS_DIALOG_HEADLINE,
  BULK_CAMPAIGN_ACCESS_DRAFT_NOTE,
  formatBulkCampaignAccessBlockedDescription,
  formatBulkCampaignAccessBlockedTitle,
  formatBulkCampaignAccessConfigureApplyLabel,
  formatBulkCampaignAccessConfigureSummary,
  formatBulkCampaignAccessDialogDescription,
  formatBulkCampaignAccessResolutionLegend,
  formatBulkCampaignAccessResolveApplyLabel,
  formatBulkCampaignAccessResolveTally,
} from '../campaign-access-labels'
import type { BulkCampaignAccessPreview } from './resolve-bulk-campaign-access-preview'

export type BulkCampaignAccessDialogPresentation = {
  configureApplyHidden: boolean
  configureApplyLabel?: string
  configureApplyDisabled: boolean
  description: string
  headline: string
  resolutionLegend?: string
  resolveApplyHidden: boolean
  resolveApplyLabel?: string
  summarySlot: ReactNode
  useCustomResolveHeadline: boolean
}

function resolveBlockedMode(input: {
  hasBlockers: boolean
  confirmedCount: number
  wouldChangeCount: number
}): 'bulk-all' | 'bulk-partial' {
  if (input.hasBlockers && input.confirmedCount === 0 && input.wouldChangeCount > 0) {
    return 'bulk-all'
  }

  return 'bulk-partial'
}

function buildSummarySlot(input: {
  configureSummary: string
  isResolvePhase: boolean
  previewHasChanges: boolean
  resolveTally?: string
}): ReactNode {
  return (
    <div className="space-y-1 text-sm text-muted-foreground">
      {input.isResolvePhase && input.resolveTally ? (
        <p>{input.resolveTally}</p>
      ) : input.previewHasChanges ? (
        <p>{input.configureSummary}</p>
      ) : null}
      <p>{BULK_CAMPAIGN_ACCESS_DRAFT_NOTE}</p>
    </div>
  )
}

function buildResolveCopy(input: {
  blockedCount: number
  blockedMode: 'bulk-all' | 'bulk-partial'
  blockedSourceKeys: readonly UsageBlockerSourceKey[]
  confirmedCount: number
  descriptor: BulkActionDescriptor
  hasBlockers: boolean
  preview: BulkCampaignAccessPreview
}) {
  if (!input.hasBlockers) {
    return {
      resolveDescription: undefined,
      resolveTally: undefined,
      resolutionLegend: undefined,
    }
  }

  return {
    resolveDescription: formatBulkCampaignAccessBlockedDescription({
      mode: input.blockedMode,
      blockedCount: input.blockedCount,
      wouldChangeCount: input.preview.wouldChangeCount,
      eligibleCount: input.confirmedCount,
      descriptor: input.descriptor,
      sourceKeys: input.blockedSourceKeys,
    }),
    resolveTally: formatBulkCampaignAccessResolveTally({
      readyCount: input.confirmedCount,
      blockedCount: input.blockedCount,
      unchangedCount: input.preview.unchangedCount,
      unchangedReasons: input.preview.unchangedReasons,
      descriptor: input.descriptor,
    }),
    resolutionLegend: formatBulkCampaignAccessResolutionLegend({
      mode: input.blockedMode === 'bulk-all' ? 'all-blocked' : 'partial',
      descriptor: input.descriptor,
    }),
  }
}

export function resolveBulkCampaignAccessDialogPresentation(input: {
  blockedCount: number
  blockedSourceKeys: readonly UsageBlockerSourceKey[]
  confirmedCount: number
  descriptor: BulkActionDescriptor
  hasBlockers: boolean
  isResolvePhase: boolean
  itemLabelPlural: string
  preview: BulkCampaignAccessPreview
  selectedCount: number
}): BulkCampaignAccessDialogPresentation {
  const blockedMode = resolveBlockedMode({
    hasBlockers: input.hasBlockers,
    confirmedCount: input.confirmedCount,
    wouldChangeCount: input.preview.wouldChangeCount,
  })
  const configureSummary = formatBulkCampaignAccessConfigureSummary({
    wouldChangeCount: input.preview.wouldChangeCount,
    unchangedCount: input.preview.unchangedCount,
    unchangedReasons: input.preview.unchangedReasons,
    descriptor: input.descriptor,
  })
  const resolveCopy = buildResolveCopy({
    blockedCount: input.blockedCount,
    blockedMode,
    blockedSourceKeys: input.blockedSourceKeys,
    confirmedCount: input.confirmedCount,
    descriptor: input.descriptor,
    hasBlockers: input.hasBlockers,
    preview: input.preview,
  })

  return {
    configureApplyDisabled: !input.preview.hasChanges,
    configureApplyHidden: !input.preview.hasChanges || input.preview.wouldChangeCount === 0,
    configureApplyLabel: formatBulkCampaignAccessConfigureApplyLabel({
      wouldChangeCount: input.preview.wouldChangeCount,
      descriptor: input.descriptor,
    }),
    description:
      input.isResolvePhase && resolveCopy.resolveDescription
        ? resolveCopy.resolveDescription
        : formatBulkCampaignAccessDialogDescription(input.selectedCount, input.itemLabelPlural),
    headline: input.hasBlockers
      ? formatBulkCampaignAccessBlockedTitle(input.descriptor)
      : BULK_CAMPAIGN_ACCESS_DIALOG_HEADLINE,
    resolutionLegend: resolveCopy.resolutionLegend,
    resolveApplyHidden: input.hasBlockers && input.confirmedCount === 0,
    resolveApplyLabel: formatBulkCampaignAccessResolveApplyLabel({
      confirmedCount: input.confirmedCount,
      descriptor: input.descriptor,
    }),
    summarySlot: buildSummarySlot({
      configureSummary,
      isResolvePhase: input.isResolvePhase,
      previewHasChanges: input.preview.hasChanges,
      resolveTally: resolveCopy.resolveTally,
    }),
    useCustomResolveHeadline: input.hasBlockers,
  }
}
