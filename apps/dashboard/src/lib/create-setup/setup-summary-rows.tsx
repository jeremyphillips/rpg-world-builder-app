import { DecisionSummaryPanel } from '@rpg/ui'

import { CREATE_SETUP_DEFAULT_CHANGE_LABEL } from './create-setup.constants'
import type { SetupSummaryRow } from './resolve-setup-summary-rows.lib'
import { setupSummaryRowsToSummaryDecisionRows } from './setup-summary-row-models'

export type SetupSummaryRowsProps = {
  eyebrow?: string
  rows: readonly SetupSummaryRow[]
  activeTargetId?: string | null
  changeLabel?: string
  onNavigate?: (targetSetId: string) => void
}

/** Presentation-only setup summary. Change is omitted for the open editor. */
export function SetupSummaryRows({
  eyebrow,
  rows,
  activeTargetId = null,
  changeLabel = CREATE_SETUP_DEFAULT_CHANGE_LABEL,
  onNavigate,
}: SetupSummaryRowsProps) {
  return (
    <DecisionSummaryPanel
      chrome="card"
      rows={setupSummaryRowsToSummaryDecisionRows(rows, onNavigate)}
      activeDecisionId={activeTargetId}
      defaultChangeLabel={changeLabel}
      {...(eyebrow !== undefined ? { eyebrow } : {})}
    />
  )
}
