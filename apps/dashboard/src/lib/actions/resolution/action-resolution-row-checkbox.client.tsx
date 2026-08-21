'use client'

import type { ActionTargetFailure } from '@rpg/contracts'
import { Checkbox } from '@rpg/ui'

import type { ActionResolutionRowModel } from '../lifecycle/action-lifecycle.types'
import { usesActionResolutionAlignmentCheckbox } from './action-resolution-row.lib'

export type ActionResolutionRowCheckboxProps<TBlocker, TFailure extends ActionTargetFailure> = {
  row: ActionResolutionRowModel<TBlocker, TFailure>
  checkboxId: string
  onCheckedChange?: (targetId: string, checked: boolean) => void
}

export function ActionResolutionRowCheckbox<TBlocker, TFailure extends ActionTargetFailure>({
  row,
  checkboxId,
  onCheckedChange,
}: ActionResolutionRowCheckboxProps<TBlocker, TFailure>) {
  const showInteractiveCheckbox = !row.disabled && onCheckedChange
  const showAlignmentCheckbox = usesActionResolutionAlignmentCheckbox(row.state)

  if (!showInteractiveCheckbox && !showAlignmentCheckbox) {
    return null
  }

  return (
    <Checkbox
      id={checkboxId}
      checked={row.checked}
      disabled={row.disabled || showAlignmentCheckbox}
      onCheckedChange={
        showInteractiveCheckbox
          ? (checked) => onCheckedChange(row.targetId, checked === true)
          : undefined
      }
      aria-label={showAlignmentCheckbox ? undefined : `Apply to ${row.targetName}`}
      aria-hidden={showAlignmentCheckbox ? true : undefined}
    />
  )
}
