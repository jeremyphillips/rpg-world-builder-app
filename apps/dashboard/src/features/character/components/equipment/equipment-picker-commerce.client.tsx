'use client'

import type { ButtonProps } from '@rpg/ui'
import { Badge } from '@rpg/ui'

import { CatalogPickerActionButton } from '../picker/catalog-picker-action-button.client'
import { EQUIPMENT_PICKER_ITEM_HEADER_TITLE_ACTIONS_CLASSES } from './equipment-picker-item-header.variants'

const EQUIPMENT_PICKER_ADD_LABEL = 'Add'

export type EquipmentPickerCommerceProps = {
  ownedQuantity: number
  disabled?: boolean
  onAdd: () => void
  buttonVariant?: ButtonProps['variant']
}

export function EquipmentPickerCommerce({
  ownedQuantity,
  disabled = false,
  onAdd,
  buttonVariant,
}: EquipmentPickerCommerceProps) {
  return (
    <div className={EQUIPMENT_PICKER_ITEM_HEADER_TITLE_ACTIONS_CLASSES}>
      {ownedQuantity > 0 ? (
        <Badge appearance="neutral" tone="neutral" size="sm">
          {ownedQuantity}
        </Badge>
      ) : null}
      <CatalogPickerActionButton variant={buttonVariant} disabled={disabled} onClick={onAdd}>
        {EQUIPMENT_PICKER_ADD_LABEL}
      </CatalogPickerActionButton>
    </div>
  )
}
