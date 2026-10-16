import type { Equipment, EquipmentInstanceSummary } from '@rpg/contracts'

import { EQUIPMENT_INSTANCE_EQUIPPED_STATUS_LABEL } from '../../../equipment/lib/instance-summary/equipment-instance-status-labels.lib'
import { mergeEquipmentInventoryCatalogReferenceStatus } from '../../../equipment/lib/inventory/equipment-catalog-reference-status.lib'
import { mapEquipmentInstanceInventoryStatus } from '../../../equipment/lib/instance-summary/map-equipment-instance-inventory-status'
import { resolveEquipmentNotProficientCompatibilityStatus } from '../../../equipment/lib/instance-summary/resolve-equipment-not-proficient-compatibility-status.lib'
import type { EntitySummaryStatusItem } from '../../../lib/entity/summary/entity-summary-status.types'

/**
 * Metadata status order for monster equipment rows:
 * 1. Compatibility (Not proficient)
 * 2. Instance lane from mapEquipmentInstanceInventoryStatus (Magical, adjustments, integrity)
 *
 * Equipped state is shown via the inline equip toggle — not a success badge.
 */
export function resolveMonsterEquipmentRowStatus(args: {
  summary: EquipmentInstanceSummary
  catalogItem: Equipment | undefined
  catalogMissing: boolean
  isProficient: boolean
}): {
  statusComposition: 'metadata'
  status: readonly EntitySummaryStatusItem[]
} {
  const compatibility = args.catalogItem
    ? resolveEquipmentNotProficientCompatibilityStatus(args.catalogItem, args.isProficient)
    : []
  const { status: instance, statusComposition } = mapEquipmentInstanceInventoryStatus(args.summary)
  const instanceWithoutEquipped = instance.filter(
    (row) =>
      !(
        row.kind === 'badge' &&
        'label' in row &&
        row.label === EQUIPMENT_INSTANCE_EQUIPPED_STATUS_LABEL
      ),
  )
  const status = mergeEquipmentInventoryCatalogReferenceStatus(
    [...compatibility, ...instanceWithoutEquipped],
    args.catalogMissing,
  )
  return { statusComposition, status }
}
