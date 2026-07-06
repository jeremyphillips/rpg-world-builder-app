import type { Equipment } from '../../../content/equipment'
import { isArmorEquipment } from '../../../content/equipment'
import type { EquipmentPool } from '../../../content/lib/equipment-grant'
import { formatEquipmentPoolLabel } from '../../../content/lib/equipment-grant'
import { resolveEquipmentContentId } from '../../../content/starting-equipment'
import type { ChoiceSetOption } from '../choice-set'
import type { CharacterBuildCatalogIndex } from '../context'

/** Resolves a bare equipment slug or opaque catalog id to the catalog content id. */
export function toEquipmentContentId(rulesetId: string, slugOrId: string): string {
  return slugOrId.includes(':') ? slugOrId : resolveEquipmentContentId(rulesetId, slugOrId)
}

type FilteredEquipmentPool = Extract<EquipmentPool, { source: 'filtered' }>

function matchesToolPool(equipment: Equipment, pool: FilteredEquipmentPool): boolean {
  return (
    equipment.kind === 'tool' &&
    (!pool.toolCategory || equipment.toolCategory === pool.toolCategory)
  )
}

function matchesWeaponPool(equipment: Equipment, pool: FilteredEquipmentPool): boolean {
  return (
    equipment.kind === 'weapon' &&
    (!pool.weaponCategory || equipment.category === pool.weaponCategory)
  )
}

function matchesArmorPool(equipment: Equipment, pool: FilteredEquipmentPool): boolean {
  return (
    isArmorEquipment(equipment) &&
    (!pool.armorCategory || equipment.category === pool.armorCategory)
  )
}

function matchesGearPool(equipment: Equipment, pool: FilteredEquipmentPool): boolean {
  return (
    equipment.kind === 'adventuring_gear' &&
    (!pool.gearKind || equipment.gearKind === pool.gearKind)
  )
}

function matchesMagicItemPool(equipment: Equipment, pool: FilteredEquipmentPool): boolean {
  if (equipment.kind !== 'magic_item') return false
  if (pool.magicItemCategory && equipment.magicItemCategory !== pool.magicItemCategory) {
    return false
  }
  if (pool.magicItemRarity && equipment.rarity !== pool.magicItemRarity) return false
  return true
}

function matchesVehiclePool(equipment: Equipment, pool: FilteredEquipmentPool): boolean {
  return (
    equipment.kind === 'vehicle' &&
    (!pool.vehicleCategory || equipment.vehicleCategory === pool.vehicleCategory)
  )
}

function matchesServicePool(equipment: Equipment, pool: FilteredEquipmentPool): boolean {
  return (
    equipment.kind === 'service' &&
    (!pool.serviceCategory || equipment.serviceCategory === pool.serviceCategory)
  )
}

const FILTERED_POOL_MATCHERS: Record<
  FilteredEquipmentPool['equipmentKind'],
  (equipment: Equipment, pool: FilteredEquipmentPool) => boolean
> = {
  tool: matchesToolPool,
  weapon: matchesWeaponPool,
  armor: matchesArmorPool,
  adventuring_gear: matchesGearPool,
  magic_item: matchesMagicItemPool,
  vehicle: matchesVehiclePool,
  service: matchesServicePool,
  mount: (equipment, pool) => equipment.kind === pool.equipmentKind,
}

function equipmentMatchesFilteredPool(equipment: Equipment, pool: FilteredEquipmentPool): boolean {
  if (equipment.kind !== pool.equipmentKind) return false
  return FILTERED_POOL_MATCHERS[pool.equipmentKind](equipment, pool)
}

/** Returns catalog equipment records matching a pool definition. */
export function listEquipmentMatchingPool(
  pool: EquipmentPool,
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId: string,
): Equipment[] {
  if (pool.source === 'explicit') {
    return pool.equipmentSlugs.flatMap((slugOrId) => {
      const equipmentId = toEquipmentContentId(rulesetId, slugOrId)
      const equipment = catalogIndex.equipment.get(equipmentId)
      return equipment ? [equipment] : []
    })
  }

  return [...catalogIndex.equipment.values()].filter((equipment) =>
    equipmentMatchesFilteredPool(equipment, pool),
  )
}

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

  return listEquipmentMatchingPool(pool, catalogIndex, rulesetId)
    .map((equipment) => ({
      id: equipment.id,
      label: equipmentOptionLabel(equipment),
    }))
    .sort((left, right) => left.label.localeCompare(right.label))
}

/** Returns true when every explicit pool slug resolves to catalog equipment. */
export function isEquipmentPoolFullyAvailable(
  pool: EquipmentPool,
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId: string,
): boolean {
  if (pool.source === 'filtered') {
    return listEquipmentMatchingPool(pool, catalogIndex, rulesetId).length > 0
  }

  return pool.equipmentSlugs.every((slugOrId) =>
    catalogIndex.equipment.has(toEquipmentContentId(rulesetId, slugOrId)),
  )
}

/** Advisory label when a filtered pool has no catalog matches (BENCH-095 enrichment). */
export function equipmentPoolSummaryLabel(pool: EquipmentPool): string {
  return pool.source === 'explicit'
    ? pool.equipmentSlugs.join(', ')
    : formatEquipmentPoolLabel(pool)
}
