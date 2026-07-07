import type { Equipment } from '../../content/equipment'
import { isArmorEquipment } from '../../content/equipment'
import type { EquipmentPool } from '../../content/lib/equipment-grant'
import { resolveEquipmentContentId } from '../../content/starting-equipment'

// ---------------------------------------------------------------------------
// Creature equipment primitives — resolves equipment ids and catalog rows from
// grant pools. Reusable across character, NPC, and monster runtime surfaces;
// no builder or character-sheet dependencies.
// ---------------------------------------------------------------------------

export type CreatureEquipmentCatalog = ReadonlyMap<string, Equipment>

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
export function listEquipmentMatchingPool(args: {
  pool: EquipmentPool
  equipment: CreatureEquipmentCatalog
  rulesetId: string
}): Equipment[] {
  const { pool, equipment, rulesetId } = args

  if (pool.source === 'explicit') {
    return pool.equipmentSlugs.flatMap((slugOrId) => {
      const equipmentId = toEquipmentContentId(rulesetId, slugOrId)
      const row = equipment.get(equipmentId)
      return row ? [row] : []
    })
  }

  return [...equipment.values()].filter((row) => equipmentMatchesFilteredPool(row, pool))
}

/** Returns true when every explicit pool slug resolves to catalog equipment. */
export function isEquipmentPoolFullyAvailable(args: {
  pool: EquipmentPool
  equipment: CreatureEquipmentCatalog
  rulesetId: string
}): boolean {
  const { pool, equipment, rulesetId } = args

  if (pool.source === 'filtered') {
    return listEquipmentMatchingPool({ pool, equipment, rulesetId }).length > 0
  }

  return pool.equipmentSlugs.every((slugOrId) =>
    equipment.has(toEquipmentContentId(rulesetId, slugOrId)),
  )
}

/** Returns true when a granted equipment slug resolves in the catalog. */
export function isGrantedEquipmentAvailable(args: {
  rulesetId: string
  equipmentSlug: string
  equipment: CreatureEquipmentCatalog
}): boolean {
  return args.equipment.has(toEquipmentContentId(args.rulesetId, args.equipmentSlug))
}
