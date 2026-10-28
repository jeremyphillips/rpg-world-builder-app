import {
  PROFICIENCY_RANK_ENTRIES,
  resolveCreatureArmorSlot,
  type Equipment,
  type EquipmentInstanceSummary,
} from '@rpg/contracts'

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
  const resolved = resolveCreatureEquipmentInventoryRowStatus({
    ...args,
    equippedStatusPresentation: 'omit',
  })
  if (!args.catalogItem || !args.isProficient || !resolveCreatureArmorSlot(args.catalogItem)) {
    return resolved
  }
  return {
    statusComposition: 'metadata',
    status: [
      ...resolved.status,
      {
        kind: 'badge',
        label: PROFICIENCY_RANK_ENTRIES.proficient.label,
        tone: 'success',
      },
    ],
  }
}
