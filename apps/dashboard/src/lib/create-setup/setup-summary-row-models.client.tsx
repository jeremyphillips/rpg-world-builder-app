'use client'

import {
  SetupSummaryCardChangeAction,
  type SetupSummaryRowProps,
} from './setup-summary-card.client'
import type { SetupSummaryEditTarget, SetupSummaryRowModel } from './create-setup.types'

export function mapSetupSummaryRowModelsToProps(args: {
  rows: readonly SetupSummaryRowModel[]
  changeLabel: string
  onEdit?: (target: SetupSummaryEditTarget) => void
}): SetupSummaryRowProps[] {
  return args.rows.map((row) => {
    const editTarget = row.editTarget
    if (editTarget == null || args.onEdit == null) {
      return {
        label: row.label,
        value: row.value,
        helper: row.helper,
      }
    }

    const valueActionAriaLabel = `Change ${row.label.toLowerCase()}`

    return {
      label: row.label,
      value: row.value,
      helper: row.helper,
      onValueClick: () => args.onEdit?.(editTarget),
      valueActionAriaLabel,
      action: (
        <SetupSummaryCardChangeAction
          changeLabel={args.changeLabel}
          ariaLabel={valueActionAriaLabel}
          onChange={() => args.onEdit?.(editTarget)}
        />
      ),
    }
  })
}
