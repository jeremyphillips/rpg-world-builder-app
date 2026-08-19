'use client'

import { SelectionSummaryChangeAction, type SelectionSummaryRowProps } from '@rpg/ui'

import type { SetupSummaryEditTarget, SetupSummaryRowModel } from './create-setup.types'

export function mapSetupSummaryRowModelsToProps(args: {
  rows: readonly SetupSummaryRowModel[]
  changeLabel: string
  onEdit?: (target: SetupSummaryEditTarget) => void
}): SelectionSummaryRowProps[] {
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
        <SelectionSummaryChangeAction
          changeLabel={args.changeLabel}
          ariaLabel={valueActionAriaLabel}
          onChange={() => args.onEdit?.(editTarget)}
        />
      ),
    }
  })
}
