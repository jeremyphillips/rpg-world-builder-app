import type { ReactNode } from 'react'
import { DecisionSummaryPanel, type SummaryDecisionRow } from '@rpg/ui'

export type CreateCompositionSummaryRow = {
  id: string
  label: string
  value: ReactNode
  helper?: ReactNode
  onChange?: () => void
  changeLabel?: string
  valueActionAriaLabel?: string
}

export type CreateCompositionSummaryProps = {
  rows: readonly CreateCompositionSummaryRow[]
  defaultChangeLabel?: string
}

function toSummaryDecisionRows(rows: readonly CreateCompositionSummaryRow[]): SummaryDecisionRow[] {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    value: row.value,
    ...(row.helper ? { description: row.helper } : {}),
    ...(row.onChange ? { onNavigate: row.onChange } : {}),
    ...(row.changeLabel ? { changeLabel: row.changeLabel } : {}),
    ...(row.valueActionAriaLabel ? { valueActionAriaLabel: row.valueActionAriaLabel } : {}),
  }))
}

/** Cardless completed-decision rows for nested composition review stacks. */
export function CreateCompositionSummary({
  rows,
  defaultChangeLabel = 'Change',
}: CreateCompositionSummaryProps) {
  return (
    <DecisionSummaryPanel
      chrome="embedded"
      rows={toSummaryDecisionRows(rows)}
      defaultChangeLabel={defaultChangeLabel}
    />
  )
}
