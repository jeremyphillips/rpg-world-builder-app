import type { Equipment, EquipmentInstanceSummary } from '@rpg/contracts'

import { resolveCreatureEquipmentInventoryRowStatus } from '../../../equipment/lib/inventory/resolve-creature-equipment-inventory-row-status.lib'
import type { EntitySummaryStatusItem } from '../../../lib/entity/summary/entity-summary-status.types'

/**
 * Monster equipment row status — equipped state is shown via the inline equip toggle,
 * not a success badge.
 */
export function resolveMonsterEquipmentRowStatus(args: {
  summary: EquipmentInstanceSummary
  catalogItem: Equipment | undefined
  catalogMissing: boolean
  isProficient: boolean
  adjustmentSegments?: readonly string[]
}): {
  statusComposition: 'metadata'
  status: readonly EntitySummaryStatusItem[]
} {
  return resolveCreatureEquipmentInventoryRowStatus({
    ...args,
    equippedStatusPresentation: 'omit',
  })
}
