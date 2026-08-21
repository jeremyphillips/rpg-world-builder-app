import type { Equipment } from '../../../../content/equipment'
import type { EquipmentPool } from '../../../../content/lib/grants/equipment-grant'
import { formatEquipmentPoolLabel } from '../../../../content/lib/grants/equipment-grant'
import { listEquipmentMatchingPool, toEquipmentContentId } from '../../../creature/equipment'
import type { ChoiceSetOption } from '../../choice-set'
import type { CharacterBuildCatalogIndex } from '../../context'

function equipmentOptionLabel(equipment: Equipment): string {
  return equipment.name
}

/** Resolves selectable ChoiceSet options for an equipment grant pool. */
export function resolveEquipmentPoolChoiceOptions(
  pool: EquipmentPool,
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId: string,
): ChoiceSetOption[] {
  if (pool.source === 'explicit') {
    return pool.equipmentSlugs.map((slugOrId) => {
      const equipmentId = toEquipmentContentId(rulesetId, slugOrId)
      const equipment = catalogIndex.equipment.get(equipmentId)
      return {
        id: equipmentId,
        label: equipment ? equipmentOptionLabel(equipment) : slugOrId,
      }
    })
  }

  return listEquipmentMatchingPool({
    pool,
    equipment: catalogIndex.equipment,
    rulesetId,
  })
    .map((equipment) => ({
      id: equipment.id,
      label: equipmentOptionLabel(equipment),
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

/** Advisory label when a filtered pool has no catalog matches (BENCH-095 enrichment). */
export function equipmentPoolSummaryLabel(pool: EquipmentPool): string {
  return pool.source === 'explicit'
    ? pool.equipmentSlugs.join(', ')
    : formatEquipmentPoolLabel(pool)
}
