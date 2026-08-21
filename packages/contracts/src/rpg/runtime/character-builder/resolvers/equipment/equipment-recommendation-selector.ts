import type { Equipment } from '../../../../content/equipment'
import type { EquipmentPool } from '../../../../content/lib/grants/equipment-grant'
import type { ToolProficiencyPool } from '../../../../content/lib/grants/proficiency-grant'
import {
  equipmentMatchesEquipmentPool,
  listEquipmentMatchingPool,
  type CreatureEquipmentCatalog,
} from '../../../creature/equipment'
import { equipmentIdMatchesReference } from '../../../creature/equipment-id-match'
import { listToolsMatchingPool } from '../../../creature/proficiencies'

// ---------------------------------------------------------------------------
// Recommendation-scoped runtime selectors — drive picker inference only.
// ---------------------------------------------------------------------------

export type EquipmentRecommendationSelector =
  | { kind: 'equipment'; equipmentId: string }
  | { kind: 'equipment_pool'; pool: EquipmentPool }
  | { kind: 'tool_proficiency_pool'; pool: ToolProficiencyPool }

/** Returns true when a catalog row matches a recommendation selector predicate. */
export function equipmentMatchesRecommendationSelector(args: {
  equipment: Equipment
  selector: EquipmentRecommendationSelector
  rulesetId: string
}): boolean {
  const { equipment, selector, rulesetId } = args

  switch (selector.kind) {
    case 'equipment':
      return equipmentIdMatchesReference({
        reference: selector.equipmentId,
        equipment,
        rulesetId,
      })
    case 'equipment_pool':
      return equipmentMatchesEquipmentPool(equipment, selector.pool, rulesetId)
    case 'tool_proficiency_pool':
      return (
        equipment.kind === 'tool' &&
        listToolsMatchingPool({
          pool: selector.pool,
          equipment: new Map([[equipment.id, equipment]]),
          rulesetId,
        }).length > 0
      )
  }
}

/** Expands a recommendation selector to matching catalog equipment rows. */
export function expandRecommendationSelector(args: {
  selector: EquipmentRecommendationSelector
  equipment: CreatureEquipmentCatalog
  rulesetId: string
}): Equipment[] {
  const { selector, equipment, rulesetId } = args

  switch (selector.kind) {
    case 'equipment': {
      const direct = equipment.get(selector.equipmentId)
      if (direct) return [direct]

      for (const row of equipment.values()) {
        if (
          equipmentIdMatchesReference({
            reference: selector.equipmentId,
            equipment: row,
            rulesetId,
          })
        ) {
          return [row]
        }
      }
      return []
    }
    case 'equipment_pool':
      return listEquipmentMatchingPool({ pool: selector.pool, equipment, rulesetId })
    case 'tool_proficiency_pool':
      return listToolsMatchingPool({ pool: selector.pool, equipment, rulesetId })
  }
}
