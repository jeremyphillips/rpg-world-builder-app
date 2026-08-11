'use client'

import type { ButtonProps } from '@rpg/ui'
import { Text } from '@rpg/ui'

import { CatalogPickerActionButton } from './catalog-picker-action-button.client'
import type { CatalogPickerRowActionPhase } from './catalog-picker-row-action.lib'
import { resolveCatalogPickerRowActionPhase } from './catalog-picker-row-action.lib'
import { CATALOG_PICKER_ADDED_LABEL } from './use-catalog-picker-commit-confirmation.client'

export type CatalogPickerSelectionActionsProps = {
  /** Explicit phase — takes precedence over legacy `selected` / pending / success flags. */
  phase?: CatalogPickerRowActionPhase
  /** @deprecated Prefer `phase`. */
  selected?: boolean
  isPending?: boolean
  isSuccess?: boolean
  canSelect?: boolean
  onAdd: () => void
  onRemove: () => void
  addLabel?: string
  successLabel?: string
  pendingLabel?: string
  buttonVariant?: ButtonProps['variant']
}

function resolveSelectionPhase(
  props: Pick<CatalogPickerSelectionActionsProps, 'phase' | 'selected' | 'isPending' | 'isSuccess'>,
): CatalogPickerRowActionPhase {
  if (props.phase) return props.phase

  return resolveCatalogPickerRowActionPhase({
    isPending: props.isPending,
    isSuccess: props.isSuccess,
    isSelected: props.selected,
  })
}

export function CatalogPickerSelectionActions({
  phase,
  selected = false,
  isPending = false,
  isSuccess = false,
  canSelect = true,
  onAdd,
  onRemove,
  addLabel = 'Add',
  successLabel = CATALOG_PICKER_ADDED_LABEL,
  pendingLabel = 'Adding…',
  buttonVariant,
}: CatalogPickerSelectionActionsProps) {
  const resolvedPhase = resolveSelectionPhase({ phase, selected, isPending, isSuccess })

  return (
    <>
      {resolvedPhase === 'success' ? (
        <Text as="span" className="text-sm font-body-emphasis text-success" role="status">
          {successLabel}
        </Text>
      ) : resolvedPhase === 'remove' ? (
        <CatalogPickerActionButton variant={buttonVariant} onClick={onRemove}>
          Remove
        </CatalogPickerActionButton>
      ) : (
        <CatalogPickerActionButton
          variant={buttonVariant}
          disabled={resolvedPhase === 'pending' || !canSelect}
          onClick={onAdd}
        >
          {resolvedPhase === 'pending' ? pendingLabel : addLabel}
        </CatalogPickerActionButton>
      )}
    </>
  )
}
