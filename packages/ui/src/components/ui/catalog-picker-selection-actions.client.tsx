'use client'

import type { ButtonProps } from './button.client'

import { CatalogPickerActionButton } from './catalog-picker-action-button.client'
import type { CatalogPickerRowActionPhase } from './catalog-picker-row-action.lib'

export const CATALOG_PICKER_ADD_LABEL = 'Add'
export const CATALOG_PICKER_REMOVE_LABEL = 'Remove'

export type CatalogPickerSelectionActionsProps = {
  phase: CatalogPickerRowActionPhase
  canSelect?: boolean
  onAdd: () => void
  onRemove: () => void
  addLabel?: string
  removeLabel?: string
  pendingLabel?: string
  buttonVariant?: ButtonProps['variant']
}

export function CatalogPickerSelectionActions({
  phase,
  canSelect = true,
  onAdd,
  onRemove,
  addLabel = CATALOG_PICKER_ADD_LABEL,
  removeLabel = CATALOG_PICKER_REMOVE_LABEL,
  pendingLabel = 'Adding…',
  buttonVariant,
}: CatalogPickerSelectionActionsProps) {
  if (phase === 'remove') {
    return (
      <CatalogPickerActionButton intent="remove" variant={buttonVariant} onClick={onRemove}>
        {removeLabel}
      </CatalogPickerActionButton>
    )
  }

  return (
    <CatalogPickerActionButton
      intent="add"
      variant={buttonVariant}
      disabled={phase === 'pending' || !canSelect}
      onClick={onAdd}
    >
      {phase === 'pending' ? pendingLabel : addLabel}
    </CatalogPickerActionButton>
  )
}
