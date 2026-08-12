'use client'

import type { ButtonProps } from '@rpg/ui'
import { Badge } from '@rpg/ui'

import { CatalogPickerActionButton } from '../picker/catalog-picker-action-button.client'
import { resolveAcquisitionCommitButtonLabel } from './equipment-acquisition-commit-labels.lib'

const EQUIPMENT_PICKER_ADD_LABEL = 'Add'

export type EquipmentPickerCommerceProps = {
  ownedQuantity: number
  showAdd?: boolean
  disabled?: boolean
  buttonLabel?: string
  isPending?: boolean
  successQuantity?: number
  onAdd: () => void
  buttonVariant?: ButtonProps['variant']
}

export function EquipmentPickerCommerce({
  ownedQuantity,
  showAdd = true,
  disabled = false,
  buttonLabel,
  isPending = false,
  successQuantity,
  onAdd,
  buttonVariant,
}: EquipmentPickerCommerceProps) {
  const label =
    buttonLabel ??
    resolveAcquisitionCommitButtonLabel({
      isPending,
      successQuantity,
      primaryActionLabel: EQUIPMENT_PICKER_ADD_LABEL,
    })

  return (
    <>
      {ownedQuantity > 0 ? (
        <Badge appearance="neutral" tone="neutral" size="sm">
          {ownedQuantity}
        </Badge>
      ) : null}
      {showAdd ? (
        <CatalogPickerActionButton
          variant={buttonVariant}
          disabled={disabled || isPending}
          onClick={onAdd}
        >
          {label}
        </CatalogPickerActionButton>
      ) : null}
    </>
  )
}
