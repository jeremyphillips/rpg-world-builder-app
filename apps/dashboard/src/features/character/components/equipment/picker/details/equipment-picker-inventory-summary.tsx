import { Heading, Text } from '@rpg/ui'

import { collectionPanelLedgerBodyClasses } from '@/lib/collection-panel/collection-panel-shell.variants'

import type { EquipmentOwnership } from '../../../../lib/equipment/equipment-ownership-index.lib'
import {
  buildEquipmentPickerInventorySummaryRows,
  type EquipmentPickerInventorySummaryRow,
} from './equipment-picker-inventory-summary.lib'

export const EQUIPMENT_PICKER_INVENTORY_SUMMARY_LABEL = 'In your inventory'

function SummaryRow({ row }: { row: EquipmentPickerInventorySummaryRow }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
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

      <div className={collectionPanelLedgerBodyClasses}>
        <div className="space-y-2">
          {rows.map((row) => (
            <SummaryRow key={row.label} row={row} />
          ))}
          <div className="border-b border-border" role="presentation" />
          <SummaryRow row={total} />
        </div>
      </div>
    </section>
  )
}
