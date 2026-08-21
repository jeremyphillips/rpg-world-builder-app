import type { ReactNode } from 'react'
import {
  SelectionSummaryChangeAction,
  SelectionSummaryRow,
  type SelectionSummaryRowProps,
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

function toSelectionSummaryRowProps(
  row: CreateCompositionSummaryRow,
  defaultChangeLabel: string,
): SelectionSummaryRowProps {
  if (row.onChange == null) {
    return {
      label: row.label,
      value: row.value,
      helper: row.helper,
    }
  }

  const changeLabel = row.changeLabel ?? defaultChangeLabel
  const valueActionAriaLabel = row.valueActionAriaLabel ?? `Change ${row.label.toLowerCase()}`

  return {
    label: row.label,
    value: row.value,
    helper: row.helper,
    onValueClick: row.onChange,
    valueActionAriaLabel,
    action: (
      <SelectionSummaryChangeAction
        changeLabel={changeLabel}
        ariaLabel={valueActionAriaLabel}
        onChange={row.onChange}
      />
    ),
  }
}

export function CreateCompositionSummary({
  rows,
  defaultChangeLabel = 'Change',
}: CreateCompositionSummaryProps) {
  if (rows.length === 0) return null

  return (
    <dl className={createCompositionSummaryRowsClasses}>
      {rows.map((row, index) => (
        <SelectionSummaryRow
          key={row.id}
          {...toSelectionSummaryRowProps(row, defaultChangeLabel)}
          showDivider={index > 0}
        />
      ))}
    </dl>
  )
}
