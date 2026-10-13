import type { ReactNode } from 'react'
import {
  mapSummaryDecisionRowsToSelectionProps,
  SelectionSummaryRow,
  type SummaryDecisionRow,
} from '@rpg/ui'

import { createCompositionSummaryRowsClasses } from './create-composition.variants'

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

export function CreateCompositionSummary({
  rows,
  defaultChangeLabel = 'Change',
}: CreateCompositionSummaryProps) {
  if (rows.length === 0) return null

  const selectionRows = mapSummaryDecisionRowsToSelectionProps({
    rows: toSummaryDecisionRows(rows),
    defaultChangeLabel,
  })

  return (
    <dl className={createCompositionSummaryRowsClasses}>
      {selectionRows.map((row, index) => (
        <SelectionSummaryRow key={rows[index]!.id} {...row} showDivider={index > 0} />
      ))}
    </dl>
  )
}
