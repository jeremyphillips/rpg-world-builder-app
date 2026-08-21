'use client'

import { NumberStepper, Text } from '@rpg/ui'

import {
  clampEquipmentStepQuantity,
  EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS,
} from '../../../lib/equipment/equipment-quantity.lib'
import {
  EQUIPMENT_PICKER_PURCHASE_QUANTITY_LABEL,
  EQUIPMENT_PICKER_PURCHASE_REMAINING_LABEL,
  EQUIPMENT_PICKER_PURCHASE_TOTAL_LABEL,
  EQUIPMENT_PICKER_PURCHASE_UNIT_PRICE_LABEL,
  type EquipmentPickerPurchasePricingViewModel,
} from './equipment-picker-purchase.lib'
import {
  equipmentPickerPurchaseDividerClasses,
  equipmentPickerPurchaseQuantityRowClasses,
  equipmentPickerPurchaseQuantityStepperShimClasses,
  equipmentPickerPurchaseRowClasses,
} from './equipment-picker-purchase.variants'

export function PurchaseRow({ label, value }: { label: string; value: string }) {
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

export function PurchaseDivider() {
  return <div className={equipmentPickerPurchaseDividerClasses} role="presentation" />
}

export type PurchaseQuantityRowProps = {
  equipmentName: string
  quantity: number
  maxQuantity: number
  disabled?: boolean
  onQuantityChange: (quantity: number) => void
}

export function PurchaseQuantityRow({
  equipmentName,
  quantity,
  maxQuantity,
  disabled = false,
  onQuantityChange,
}: PurchaseQuantityRowProps) {
  return (
    <div className={equipmentPickerPurchaseQuantityRowClasses}>
      <Text as="span" variant="muted">
        {EQUIPMENT_PICKER_PURCHASE_QUANTITY_LABEL}
      </Text>
      <div className={equipmentPickerPurchaseQuantityStepperShimClasses}>
        <NumberStepper
          aria-label={`${EQUIPMENT_PICKER_PURCHASE_QUANTITY_LABEL} for ${equipmentName}`}
          size="sm"
          bordered={true}
          digits={EQUIPMENT_STEP_QUANTITY_INPUT_DIGITS}
          min={1}
          max={maxQuantity}
          value={quantity}
          disabled={disabled}
          onChange={(next) => {
            onQuantityChange(clampEquipmentStepQuantity(next, maxQuantity))
          }}
        />
      </div>
    </div>
  )
}

export type EquipmentPickerPurchaseDetailsRowsProps = {
  equipmentName: string
  viewModel: EquipmentPickerPurchasePricingViewModel
  disabled?: boolean
  onQuantityChange: (quantity: number) => void
}

export function EquipmentPickerPurchaseDetailsRows({
  equipmentName,
  viewModel,
  disabled = false,
  onQuantityChange,
}: EquipmentPickerPurchaseDetailsRowsProps) {
  return (
    <div className="space-y-2">
      <PurchaseQuantityRow
        equipmentName={equipmentName}
        quantity={viewModel.quantity}
        maxQuantity={viewModel.maxQuantity}
        disabled={disabled}
        onQuantityChange={onQuantityChange}
      />
      <PurchaseRow
        label={EQUIPMENT_PICKER_PURCHASE_UNIT_PRICE_LABEL}
        value={viewModel.unitPriceLabel}
      />
      <PurchaseRow label={EQUIPMENT_PICKER_PURCHASE_TOTAL_LABEL} value={viewModel.totalLabel} />
      <PurchaseDivider />
      <PurchaseRow
        label={EQUIPMENT_PICKER_PURCHASE_REMAINING_LABEL}
        value={viewModel.remainingAfterLabel}
      />
    </div>
  )
}
