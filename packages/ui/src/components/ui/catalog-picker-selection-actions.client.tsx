'use client'

import type { ButtonProps } from './button.client'

import {
  CatalogPickerRowAction,
  type CatalogPickerRowActionTooltip,
} from './catalog-picker-row-action.client'
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
  /** Which verb is in flight when `phase` is pending. */
  pendingDirection?: 'acquire' | 'release'
  buttonVariant?: ButtonProps['variant']
  failed?: boolean
  entityKey?: string
  tooltip?: CatalogPickerRowActionTooltip
}

export function CatalogPickerSelectionActions({
  phase,
  canSelect = true,
  onAdd,
  onRemove,
  addLabel = CATALOG_PICKER_ADD_LABEL,
  removeLabel = CATALOG_PICKER_REMOVE_LABEL,
  pendingLabel,
  pendingDirection = 'acquire',
  buttonVariant,
  failed = false,
  entityKey,
  tooltip,
}: CatalogPickerSelectionActionsProps) {
  const pending = phase === 'pending'
  const releasing = phase === 'remove' || (pending && pendingDirection === 'release')
  const actionLabel = releasing ? removeLabel : addLabel
  const inactive = pending || (!releasing && !canSelect)

  return (
    <CatalogPickerRowAction
      intent={releasing ? 'remove' : 'add'}
      actionLabel={actionLabel}
      pendingLabel={pendingLabel}
      pending={pending}
      disabled={inactive}
      failed={failed}
      entityKey={entityKey}
      tooltip={inactive && !pending ? tooltip : undefined}
      variant={buttonVariant}
      onClick={releasing ? onRemove : onAdd}
    />
  )
}
