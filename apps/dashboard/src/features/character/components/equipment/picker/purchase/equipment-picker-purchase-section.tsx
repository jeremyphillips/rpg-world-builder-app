import { Button, Heading, Text } from '@rpg/ui'

import {
  EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL,
  type EquipmentPickerPurchaseViewModel,
} from './equipment-picker-purchase.lib'
import { EquipmentPickerPurchaseDetailsRows } from './equipment-picker-purchase-rows'
import {
  equipmentPickerPurchaseInsetPanelClasses,
  equipmentPickerPurchaseInsetPanelContentClasses,
} from './equipment-picker-purchase.variants'

export type EquipmentPickerPurchaseSectionProps = {
  equipmentName: string
  bundleLabel?: string
  viewModel: Extract<EquipmentPickerPurchaseViewModel, { mode: 'new' }>
  disabled?: boolean
  onQuantityChange: (quantity: number) => void
  onCommit: () => void
}

/** Purchase review block for new equipment rows in the picker collapsible body. */
export function EquipmentPickerPurchaseSection({
  equipmentName,
  bundleLabel,
  viewModel,
  disabled = false,
  onQuantityChange,
  onCommit,
}: EquipmentPickerPurchaseSectionProps) {
  return (
    <section aria-labelledby={`${equipmentName}-purchase-heading`} className="space-y-3">
      <Heading variant="group" as="h3" id={`${equipmentName}-purchase-heading`}>
        {EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL}
      </Heading>

      <div className={equipmentPickerPurchaseInsetPanelClasses}>
        <div className={equipmentPickerPurchaseInsetPanelContentClasses}>
          {bundleLabel ? (
            <Text as="p" variant="caption">
              {bundleLabel}
            </Text>
          ) : null}

          <EquipmentPickerPurchaseDetailsRows
            equipmentName={equipmentName}
            viewModel={viewModel}
            disabled={disabled}
            onQuantityChange={onQuantityChange}
          />

          <Button type="button" size="sm" disabled={disabled} onClick={onCommit}>
            {viewModel.commitLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
