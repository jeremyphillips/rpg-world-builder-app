import { Heading, Text } from '@rpg/ui'

import type { EquipmentOwnership } from '../../../../lib/equipment/equipment-ownership-index.lib'
import {
  buildEquipmentPickerInventorySummaryRows,
  type EquipmentPickerInventorySummaryRow,
} from './equipment-picker-inventory-summary.lib'
import {
  equipmentPickerInventorySummaryDividerClasses,
  equipmentPickerInventorySummaryPanelClasses,
  equipmentPickerInventorySummaryRowClasses,
} from './equipment-picker-inventory-summary.variants'

export const EQUIPMENT_PICKER_INVENTORY_SUMMARY_LABEL = 'In your inventory'

function SummaryRow({ row }: { row: EquipmentPickerInventorySummaryRow }) {
  return (
    <div className={equipmentPickerInventorySummaryRowClasses}>
      <Text as="span" variant="muted">
        {row.label}
      </Text>
      <Text as="span" className="tabular-nums">
        {row.value}
      </Text>
    </div>
  )
}

export type EquipmentPickerInventorySummaryProps = {
  equipmentId: string
  ownership: EquipmentOwnership
}

/**
 * Read-only ledger of where the owned copies came from. Every mutation lives in the
 * card header, so this surface carries no controls.
 */
export function EquipmentPickerInventorySummary({
  equipmentId,
  ownership,
}: EquipmentPickerInventorySummaryProps) {
  if (ownership.totalQuantity === 0) return null

  const { rows, total } = buildEquipmentPickerInventorySummaryRows(ownership)
  const headingId = `${equipmentId}-inventory-summary-heading`

  return (
    <section aria-labelledby={headingId} className="space-y-3">
      <Heading variant="group" as="h3" id={headingId}>
        {EQUIPMENT_PICKER_INVENTORY_SUMMARY_LABEL}
      </Heading>

      <div className={equipmentPickerInventorySummaryPanelClasses}>
        <div className="space-y-2">
          {rows.map((row) => (
            <SummaryRow key={row.label} row={row} />
          ))}
          <div className={equipmentPickerInventorySummaryDividerClasses} role="presentation" />
          <SummaryRow row={total} />
        </div>
      </div>
    </section>
  )
}
