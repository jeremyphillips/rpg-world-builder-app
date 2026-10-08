'use client'

import type { ButtonProps } from './button.client'
import { Text } from './text'

import { CatalogPickerActionButton } from './catalog-picker-action-button.client'
import type { CatalogPickerRowActionPhase } from './catalog-picker-row-action.lib'

const CATALOG_PICKER_ADDED_LABEL = '✓ Added'
const CATALOG_PICKER_REMOVE_LABEL = 'Remove'

export type CatalogPickerSelectionActionsProps = {
  phase: CatalogPickerRowActionPhase
  canSelect?: boolean
  onAdd: () => void
  onRemove: () => void
  addLabel?: string
  removeLabel?: string
  successLabel?: string
  pendingLabel?: string
  buttonVariant?: ButtonProps['variant']
}

export function CatalogPickerSelectionActions({
  phase,
  canSelect = true,
  onAdd,
  onRemove,
  addLabel = 'Add',
  removeLabel = CATALOG_PICKER_REMOVE_LABEL,
  successLabel = CATALOG_PICKER_ADDED_LABEL,
  pendingLabel = 'Adding…',
  buttonVariant,
}: CatalogPickerSelectionActionsProps) {
  return (
    <>
      {phase === 'success' ? (
        <Text as="span" className="text-sm font-body-emphasis text-success" role="status">
          {successLabel}
        </Text>
      ) : phase === 'remove' ? (
        <CatalogPickerActionButton intent="remove" variant={buttonVariant} onClick={onRemove}>
          {removeLabel}
        </CatalogPickerActionButton>
      ) : (
        <CatalogPickerActionButton
          intent="add"
          variant={buttonVariant}
          disabled={phase === 'pending' || !canSelect}
          onClick={onAdd}
        >
          {phase === 'pending' ? pendingLabel : addLabel}
        </CatalogPickerActionButton>
      )}
    </>
  )
}
