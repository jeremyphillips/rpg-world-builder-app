'use client'

import type { ButtonProps } from '@rpg/ui'
import { Text } from '@rpg/ui'

import { CatalogPickerActionButton } from '../picker/catalog-picker-action-button.client'
import {
  EQUIPMENT_PICKER_ADDED_LABEL,
  EQUIPMENT_PICKER_OWNED_QUANTITY_LABEL_PREFIX,
} from './equipment-picker-drawer.types'
import { EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL } from './equipment-picker-purchase.lib'
import {
  EQUIPMENT_PICKER_COMMERCE_ADDED_CLASSES,
  EQUIPMENT_PICKER_COMMERCE_OWNED_CLASSES,
  EQUIPMENT_PICKER_COMMERCE_PRICE_CLASSES,
  EQUIPMENT_PICKER_ITEM_HEADER_COMMERCE_CLASSES,
} from './equipment-picker-item-header.variants'

const EQUIPMENT_PICKER_ADD_LABEL = 'Add'

export type EquipmentPickerCommerceProps = {
  priceLabel: string
  owned: boolean
  stackable: boolean
  ownedQuantity: number
  disabled?: boolean
  onAdd: () => void
  buttonVariant?: ButtonProps['variant']
}

export function EquipmentPickerCommerce({
  priceLabel,
  owned,
  stackable,
  ownedQuantity,
  disabled = false,
  onAdd,
  buttonVariant,
}: EquipmentPickerCommerceProps) {
  return (
    <div className={EQUIPMENT_PICKER_ITEM_HEADER_COMMERCE_CLASSES}>
      <Text as="span" className={EQUIPMENT_PICKER_COMMERCE_PRICE_CLASSES}>
        {priceLabel}
      </Text>
      {owned && stackable ? (
        <>
          <Text as="span" className={EQUIPMENT_PICKER_COMMERCE_OWNED_CLASSES}>
            {EQUIPMENT_PICKER_OWNED_QUANTITY_LABEL_PREFIX} {ownedQuantity}
          </Text>
          <CatalogPickerActionButton variant={buttonVariant} disabled={disabled} onClick={onAdd}>
            {EQUIPMENT_PICKER_PURCHASE_ADD_ANOTHER_LABEL}
          </CatalogPickerActionButton>
        </>
      ) : owned ? (
        <Text as="span" className={EQUIPMENT_PICKER_COMMERCE_ADDED_CLASSES}>
          {EQUIPMENT_PICKER_ADDED_LABEL}
        </Text>
      ) : (
        <CatalogPickerActionButton variant={buttonVariant} disabled={disabled} onClick={onAdd}>
          {EQUIPMENT_PICKER_ADD_LABEL}
        </CatalogPickerActionButton>
      )}
    </div>
  )
}
