'use client'

import { Button, Heading, NumberInput, Text } from '@rpg/ui'

import {
  clampEquipmentStepQuantity,
  EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS,
} from '../../lib/equipment-quantity.lib'
import {
  EQUIPMENT_PICKER_PURCHASE_QUANTITY_LABEL,
  EQUIPMENT_PICKER_PURCHASE_REMAINING_LABEL,
  EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL,
  EQUIPMENT_PICKER_PURCHASE_TOTAL_LABEL,
  EQUIPMENT_PICKER_PURCHASE_UNIT_PRICE_LABEL,
  type EquipmentPickerPurchaseViewModel,
} from './equipment-picker-purchase.lib'
import { equipmentPickerPurchaseRowClasses } from './equipment-picker-purchase.variants'

export type EquipmentPickerPurchaseSectionProps = {
  equipmentName: string
  viewModel: Extract<EquipmentPickerPurchaseViewModel, { mode: 'new' }>
  disabled?: boolean
  onQuantityChange: (quantity: number) => void
  onCommit: () => void
}

function PurchaseRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={equipmentPickerPurchaseRowClasses}>
      <Text as="span" variant="muted">
        {label}
      </Text>
      <Text as="span" className="tabular-nums">
        {value}
      </Text>
    </div>
  )
}

/** Purchase review block for new equipment rows in the picker collapsible body. */
export function EquipmentPickerPurchaseSection({
  equipmentName,
  viewModel,
  disabled = false,
  onQuantityChange,
  onCommit,
}: EquipmentPickerPurchaseSectionProps) {
  return (
    <section aria-labelledby={`${equipmentName}-purchase-heading`} className="space-y-3">
      <Heading variant="subsection" as="h3" id={`${equipmentName}-purchase-heading`}>
        {EQUIPMENT_PICKER_PURCHASE_SECTION_LABEL}
      </Heading>

      <div className="space-y-2">
        <div className={equipmentPickerPurchaseRowClasses}>
          <Text as="span" variant="muted">
            {EQUIPMENT_PICKER_PURCHASE_QUANTITY_LABEL}
          </Text>
          <NumberInput
            aria-label={`${EQUIPMENT_PICKER_PURCHASE_QUANTITY_LABEL} for ${equipmentName}`}
            size="sm"
            digits={EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS}
            min={1}
            stepperMin={1}
            stepperMax={viewModel.maxQuantity}
            value={viewModel.quantity}
            disabled={disabled}
            onChange={(event) => {
              const next = Number(event.target.value)
              onQuantityChange(clampEquipmentStepQuantity(next, viewModel.maxQuantity))
            }}
          />
        </div>

        <PurchaseRow
          label={EQUIPMENT_PICKER_PURCHASE_UNIT_PRICE_LABEL}
          value={viewModel.unitPriceLabel}
        />
        <PurchaseRow label={EQUIPMENT_PICKER_PURCHASE_TOTAL_LABEL} value={viewModel.totalLabel} />
        <PurchaseRow
          label={EQUIPMENT_PICKER_PURCHASE_REMAINING_LABEL}
          value={viewModel.remainingAfterLabel}
        />
      </div>

      <Button type="button" size="sm" disabled={disabled} onClick={onCommit}>
        {viewModel.commitLabel}
      </Button>
    </section>
  )
}
