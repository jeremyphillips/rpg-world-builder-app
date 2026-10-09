import { copperToDisplayWealth, formatWealth } from '@rpg/contracts'
import { joinInlineMetadata } from '@rpg/contracts/primitives'

import {
  EQUIPMENT_INVENTORY_GRANT_SOURCE_LABEL,
  EQUIPMENT_INVENTORY_PACKAGE_SOURCE_LABEL,
} from '../../../../lib/equipment/equipment-step.lib'
import { formatMagicItemChoiceRarityPhrase } from '../../../../lib/equipment/magic-item-choice-label.lib'
import type { EquipmentOwnership } from '../../../../lib/equipment/equipment-ownership-index.lib'

export const EQUIPMENT_PICKER_INVENTORY_TOTAL_LABEL = 'Total owned'
export const EQUIPMENT_PICKER_INVENTORY_PURCHASED_LABEL = 'Purchased'
export const EQUIPMENT_PICKER_INVENTORY_CONVERTED_LABEL = 'Converted from package'

export type EquipmentPickerInventorySummaryRow = {
  label: string
  value: string
}

function quantityValue(quantity: number, spendCp: number): string {
  if (spendCp <= 0) return `×${quantity}`
  return joinInlineMetadata([`×${quantity}`, formatWealth(copperToDisplayWealth(spendCp))])
}

/** One row per contribution bucket, in the order the header's provenance line uses. */
export function buildEquipmentPickerInventorySummaryRows(ownership: EquipmentOwnership): {
  rows: readonly EquipmentPickerInventorySummaryRow[]
  total: EquipmentPickerInventorySummaryRow
} {
  const rows: EquipmentPickerInventorySummaryRow[] = []

  if (ownership.packageQuantity > 0) {
    rows.push({
      label: EQUIPMENT_INVENTORY_PACKAGE_SOURCE_LABEL,
      value: `×${ownership.packageQuantity}`,
    })
  }

  for (const choice of ownership.choices) {
    rows.push({
      label: `${formatMagicItemChoiceRarityPhrase(choice.rarity, choice.requirement)} choice`,
      value: `×${choice.quantity}`,
    })
  }

  if (ownership.lockedPurchased.quantity > 0) {
    rows.push({
      label: EQUIPMENT_PICKER_INVENTORY_CONVERTED_LABEL,
      value: quantityValue(ownership.lockedPurchased.quantity, ownership.lockedPurchased.spendCp),
    })
  }

  if (ownership.editablePurchased.quantity > 0) {
    rows.push({
      label: EQUIPMENT_PICKER_INVENTORY_PURCHASED_LABEL,
      value: quantityValue(
        ownership.editablePurchased.quantity,
        ownership.editablePurchased.spendCp,
      ),
    })
  }

  if (ownership.grantQuantity > 0) {
    rows.push({
      label: EQUIPMENT_INVENTORY_GRANT_SOURCE_LABEL,
      value: `×${ownership.grantQuantity}`,
    })
  }

  return {
    rows,
    total: {
      label: EQUIPMENT_PICKER_INVENTORY_TOTAL_LABEL,
      value: `×${ownership.totalQuantity}`,
    },
  }
}
