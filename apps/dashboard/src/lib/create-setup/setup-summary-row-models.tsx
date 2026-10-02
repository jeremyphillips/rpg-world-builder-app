import { SelectionSummaryChangeAction, type SelectionSummaryRowProps } from '@rpg/ui'

import { CREATE_SETUP_DEFAULT_CHANGE_LABEL } from './create-setup.constants'
import type { SetupSummaryEditTarget, SetupSummaryRowModel } from './create-setup.types'
import type { SetupSummaryRow } from './resolve-setup-summary-rows.lib'

export function mapSetupSummaryRowsToSelectionProps(args: {
  rows: readonly SetupSummaryRow[]
  activeTargetId?: string | null
  changeLabel?: string
  onNavigate?: (targetSetId: string) => void
}): SelectionSummaryRowProps[] {
  const changeLabel = args.changeLabel ?? CREATE_SETUP_DEFAULT_CHANGE_LABEL

  return args.rows.map((row) => {
    const isActive = args.activeTargetId != null && row.targetSetId === args.activeTargetId
    if (isActive || args.onNavigate == null) {
      return {
        label: row.label,
        value: row.value,
        helper: row.secondary,
      }
    }

    const valueActionAriaLabel = `Change ${row.label.toLowerCase()}`
    const onNavigate = args.onNavigate

    return {
      label: row.label,
      value: row.value,
      helper: row.secondary,
      onValueClick: () => onNavigate(row.targetSetId),
      valueActionAriaLabel,
      action: (
        <SelectionSummaryChangeAction
          changeLabel={changeLabel}
          ariaLabel={valueActionAriaLabel}
          onChange={() => onNavigate(row.targetSetId)}
        />
      ),
    }
  })
}

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
