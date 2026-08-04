import {
  partitionApplyOutcomes,
  type ActionApplyOutcome,
  type ActionTargetFailure,
} from '@rpg/contracts'
import { toast } from '@rpg/ui'

import {
  formatActionMixedResult,
  formatActionPartialSuccess,
  formatActionSuccess,
} from './action-messages'

export type NotifyActionOutcomesInput = {
  outcomes: readonly ActionApplyOutcome<unknown, ActionTargetFailure>[]
  nounPlural: string
  nounSingular?: string
  formatSuccess?: (updatedCount: number) => string
}

type OutcomeCounts = ReturnType<typeof partitionApplyOutcomes>

function hasReportableOutcomes(counts: OutcomeCounts): boolean {
  return counts.updated.length > 0 || counts.blocked.length > 0 || counts.failed.length > 0
}

function isFailureOnly(counts: OutcomeCounts): boolean {
  return counts.failed.length > 0 && counts.updated.length === 0 && counts.blocked.length === 0
}

function formatActionOutcomeSummary(
  counts: OutcomeCounts,
  nounPlural: string,
  nounSingular: string,
  formatSuccess?: (updatedCount: number) => string,
): string {
  if (isFailureOnly(counts)) {
    return formatActionPartialSuccess(0, 0, counts.failed.length, nounPlural, nounSingular)
  }

  if (counts.blocked.length > 0 || counts.failed.length > 0) {
    return formatActionPartialSuccess(
      counts.updated.length,
      counts.blocked.length,
      counts.failed.length,
      nounPlural,
      nounSingular,
    )
  }

  if (counts.unchanged.length > 0 && counts.updated.length > 0) {
    return formatActionMixedResult(
      counts.updated.length,
      counts.failed.length,
      counts.unchanged.length,
      nounPlural,
      nounSingular,
    )
  }

  if (formatSuccess) {
    return formatSuccess(counts.updated.length)
  }

  return formatActionSuccess(counts.updated.length, nounPlural, nounSingular)
}

function resolveActionOutcomeToastTone(counts: OutcomeCounts): 'error' | 'warning' | 'success' {
  if (isFailureOnly(counts)) {
    return 'error'
  }

  if (counts.blocked.length > 0 || counts.failed.length > 0) {
    return 'warning'
  }

  return 'success'
}

/** Emit a single toast after an action modal closes with apply outcomes. */
export function notifyActionOutcomes({
  outcomes,
  nounPlural,
  nounSingular = nounPlural,
  formatSuccess,
}: NotifyActionOutcomesInput): void {
  const counts = partitionApplyOutcomes(outcomes)

  if (!hasReportableOutcomes(counts)) {
    return
  }

  const summary = formatActionOutcomeSummary(counts, nounPlural, nounSingular, formatSuccess)
  const tone = resolveActionOutcomeToastTone(counts)

  if (tone === 'error') {
    toast.error(summary)
    return
  }

  if (tone === 'warning') {
    toast.warning(summary)
    return
  }

  toast.success(summary)
}
