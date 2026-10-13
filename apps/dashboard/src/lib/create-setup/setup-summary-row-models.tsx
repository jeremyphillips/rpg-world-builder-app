import {
  mapSummaryDecisionRowsToSelectionProps,
  type SelectionSummaryRowProps,
  type SummaryDecisionCard,
  type SummaryDecisionRow,
} from '@rpg/ui'

import { CREATE_SETUP_DEFAULT_CHANGE_LABEL } from './create-setup.constants'
import type { SetupSummaryEditTarget, SetupSummaryRowModel } from './create-setup.types'
import type { SetupSummaryCard, SetupSummaryRow } from './resolve-setup-summary-rows.lib'

export function setupSummaryRowsToSummaryDecisionRows(
  rows: readonly SetupSummaryRow[],
  onNavigate?: (targetSetId: string) => void,
): SummaryDecisionRow[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    value: row.value,
    ...(row.secondary ? { description: row.secondary } : {}),
    decisionId: row.targetSetId,
    ...(onNavigate ? { onNavigate: () => onNavigate(row.targetSetId) } : {}),
  }))
}

export function mapSetupSummaryRowsToSelectionProps(args: {
  rows: readonly SetupSummaryRow[]
  activeTargetId?: string | null
  changeLabel?: string
  onNavigate?: (targetSetId: string) => void
}): SelectionSummaryRowProps[] {
  return mapSummaryDecisionRowsToSelectionProps({
    rows: setupSummaryRowsToSummaryDecisionRows(args.rows, args.onNavigate),
    activeDecisionId: args.activeTargetId,
    defaultChangeLabel: args.changeLabel ?? CREATE_SETUP_DEFAULT_CHANGE_LABEL,
  })
}

export function mapSetupSummaryRowModelsToProps(args: {
  rows: readonly SetupSummaryRowModel[]
  changeLabel: string
  onEdit?: (target: SetupSummaryEditTarget) => void
}): SelectionSummaryRowProps[] {
  const decisionRows: SummaryDecisionRow[] = args.rows.map((row) => {
    const editTarget = row.editTarget
    return {
      id: row.id,
      label: row.label,
      value: row.value,
      ...(row.helper ? { description: row.helper } : {}),
      ...(editTarget && args.onEdit
        ? {
            decisionId: editTarget.id,
            onNavigate: () => args.onEdit?.(editTarget),
          }
        : {}),
    }
  })

  return mapSummaryDecisionRowsToSelectionProps({
    rows: decisionRows,
    defaultChangeLabel: args.changeLabel,
  })
}

export function setupSummaryCardsToDecisionCards(
  cards: readonly SetupSummaryCard[],
  onNavigate: (targetSetId: string) => void,
): SummaryDecisionCard[] {
  return cards.map((card) => ({
    id: card.id,
    eyebrow: card.eyebrow,
    rows: setupSummaryRowsToSummaryDecisionRows(card.rows, onNavigate),
  }))
}
