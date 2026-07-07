import type { EquipmentInventoryRow } from '../../lib/equipment-step.lib'

export function equipmentInventoryRowKey(row: EquipmentInventoryRow): string {
  const removeKey =
    row.removeTarget?.kind === 'purchase'
      ? String(row.removeTarget.purchaseIndex)
      : row.removeTarget?.kind === 'package'
        ? row.removeTarget.packageItemKey
        : 'static'

  return `${row.group}-${row.entry.equipmentId}-${row.sourceLabel}-${removeKey}`
}
