import {
  BULK_CHANGE_PARENT_DIALOG_HEADLINE,
  formatBulkChangeParentBlockedDescription,
  formatBulkChangeParentBlockedTitle,
  formatBulkChangeParentConfigureApplyLabel,
  formatBulkChangeParentConfigureSummary,
  formatBulkChangeParentDialogDescription,
  formatBulkChangeParentResolutionLegend,
  formatBulkChangeParentResolveApplyLabel,
  formatBulkChangeParentResolveTally,
} from './bulk-change-parent-labels'
import type { BulkChangeParentPreview } from './resolve-bulk-change-parent-preview'

type UnchangedContext = Pick<
  BulkChangeParentPreview,
  'unchangedCount' | 'unchangedReasons' | 'parentName'
>

export type BulkChangeParentDialogPresentation = {
  configureApplyHidden: boolean
  configureApplyLabel?: string
  description: string
  headline: string
  resolutionLegend?: string
  resolveApplyHidden: boolean
  resolveApplyLabel?: string
  summarySlot: React.ReactNode
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
  isConfigured: boolean
  isResolvePhase: boolean
  resolveTally?: string
}): React.ReactNode {
  if (input.isResolvePhase && input.resolveTally) {
    return <p className="text-sm text-muted-foreground">{input.resolveTally}</p>
  }

  if (input.isConfigured) {
    return <p className="text-sm text-muted-foreground">{input.configureSummary}</p>
  }

  return null
}

function buildResolveCopy(input: {
  blockedCount: number
  blockedMode: 'bulk-all' | 'bulk-partial'
  confirmedCount: number
  hasBlockers: boolean
  preview: BulkChangeParentPreview
  unchangedContext: UnchangedContext
}) {
  if (!input.hasBlockers) {
    return {
      resolveDescription: undefined,
      resolveTally: undefined,
      resolutionLegend: undefined,
    }
  }

  return {
    resolveDescription: formatBulkChangeParentBlockedDescription({
      mode: input.blockedMode,
      blockedCount: input.blockedCount,
      wouldChangeCount: input.preview.wouldChangeCount,
      ...input.unchangedContext,
    }),
    resolveTally: formatBulkChangeParentResolveTally({
      readyCount: input.confirmedCount,
      blockedCount: input.blockedCount,
      ...input.unchangedContext,
    }),
    resolutionLegend: formatBulkChangeParentResolutionLegend({
      mode: input.blockedMode === 'bulk-all' ? 'all-blocked' : 'partial',
    }),
  }
}

export function resolveBulkChangeParentDialogPresentation(input: {
  isResolvePhase: boolean
  hasBlockers: boolean
  blockedCount: number
  confirmedCount: number
  preview: BulkChangeParentPreview
  selectedCount: number
}): BulkChangeParentDialogPresentation {
  const blockedMode = resolveBlockedMode({
    hasBlockers: input.hasBlockers,
    confirmedCount: input.confirmedCount,
    wouldChangeCount: input.preview.wouldChangeCount,
  })
  const unchangedContext: UnchangedContext = {
    unchangedCount: input.preview.unchangedCount,
    unchangedReasons: input.preview.unchangedReasons,
    parentName: input.preview.parentName,
  }
  const configureSummary = formatBulkChangeParentConfigureSummary({
    wouldChangeCount: input.preview.wouldChangeCount,
    isClearing: input.preview.isClearing,
    ...unchangedContext,
  })
  const resolveCopy = buildResolveCopy({
    blockedCount: input.blockedCount,
    blockedMode,
    confirmedCount: input.confirmedCount,
    hasBlockers: input.hasBlockers,
    preview: input.preview,
    unchangedContext,
  })

  return {
    configureApplyHidden: !input.preview.isConfigured || input.preview.wouldChangeCount === 0,
    configureApplyLabel: formatBulkChangeParentConfigureApplyLabel({
      wouldChangeCount: input.preview.wouldChangeCount,
      isClearing: input.preview.isClearing,
    }),
    description:
      input.isResolvePhase && resolveCopy.resolveDescription
        ? resolveCopy.resolveDescription
        : formatBulkChangeParentDialogDescription(input.selectedCount),
    headline: input.hasBlockers
      ? formatBulkChangeParentBlockedTitle(blockedMode)
      : BULK_CHANGE_PARENT_DIALOG_HEADLINE,
    resolutionLegend: resolveCopy.resolutionLegend,
    resolveApplyHidden: input.hasBlockers && input.confirmedCount === 0,
    resolveApplyLabel: formatBulkChangeParentResolveApplyLabel(input.confirmedCount),
    summarySlot: buildSummarySlot({
      configureSummary,
      isConfigured: input.preview.isConfigured,
      isResolvePhase: input.isResolvePhase,
      resolveTally: resolveCopy.resolveTally,
    }),
    useCustomResolveHeadline: input.hasBlockers,
  }
}
