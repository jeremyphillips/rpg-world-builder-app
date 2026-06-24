import type { Equipment } from '@rpg/contracts'
import {
  formatWeight,
  getAbilityLabel,
  getGearKindLabel,
  getMagicItemCategoryLabel,
  getMagicItemRarityLabel,
  getServiceCategoryLabel,
  getToolCategoryLabel,
  getVehicleCategoryLabel,
  isArmorEquipment,
  isWeaponEquipment,
} from '@rpg/contracts'

import { getArmorStatRows } from '../../../armor/lib/armor-stat-rows'
import type { ContentStatRowData } from '../../../lib/content-stat-rows'
import { getWeaponStatRows } from '../../../weapons/lib/weapon-stat-rows'

type StatRow = ContentStatRowData

function getAdventuringGearStatRows(
  item: Extract<Equipment, { kind: 'adventuring_gear' }>,
): StatRow[] {
  return [
    { label: 'Gear kind', value: getGearKindLabel(item.gearKind) },
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
    ...(item.bundleSize !== undefined
      ? [{ label: 'Bundle size', value: String(item.bundleSize) }]
      : []),
    ...(item.storage ? [{ label: 'Storage', value: item.storage }] : []),
    ...(item.capacity ? [{ label: 'Capacity', value: String(item.capacity) }] : []),
    ...(item.properties?.length
      ? [{ label: 'Properties', value: item.properties.join(', ') }]
      : []),
  ]
}

function getToolStatRows(item: Extract<Equipment, { kind: 'tool' }>): StatRow[] {
  return [
    { label: 'Category', value: getToolCategoryLabel(item.toolCategory) },
    ...(item.ability ? [{ label: 'Ability', value: getAbilityLabel(item.ability) }] : []),
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
  ]
}

function getMountStatRows(item: Extract<Equipment, { kind: 'mount' }>): StatRow[] {
  return [
    { label: 'Carrying capacity', value: formatWeight(item.carryingCapacity) },
    ...(item.speed ? [{ label: 'Speed', value: item.speed }] : []),
  ]
}

function getVehicleStatRows(item: Extract<Equipment, { kind: 'vehicle' }>): StatRow[] {
  return [
    { label: 'Category', value: getVehicleCategoryLabel(item.vehicleCategory) },
    ...(item.speed ? [{ label: 'Speed', value: item.speed }] : []),
    ...(item.capacity ? [{ label: 'Cargo capacity', value: formatWeight(item.capacity) }] : []),
    ...(item.crew !== undefined ? [{ label: 'Crew', value: String(item.crew) }] : []),
    ...(item.passengers !== undefined
      ? [{ label: 'Passengers', value: String(item.passengers) }]
      : []),
    ...(item.cargoTons !== undefined ? [{ label: 'Cargo', value: `${item.cargoTons} tons` }] : []),
    ...(item.ac !== undefined ? [{ label: 'AC', value: String(item.ac) }] : []),
    ...(item.hp !== undefined ? [{ label: 'HP', value: String(item.hp) }] : []),
    ...(item.damageThreshold !== undefined
      ? [{ label: 'Damage threshold', value: String(item.damageThreshold) }]
      : []),
  ]
}

function getServiceStatRows(item: Extract<Equipment, { kind: 'service' }>): StatRow[] {
  return [
    { label: 'Category', value: getServiceCategoryLabel(item.serviceCategory) },
    ...(item.duration ? [{ label: 'Duration', value: item.duration }] : []),
    ...(item.notes ? [{ label: 'Notes', value: item.notes }] : []),
  ]
}

function getMagicItemStatRows(item: Extract<Equipment, { kind: 'magic_item' }>): StatRow[] {
  return [
    ...(item.rarity ? [{ label: 'Rarity', value: getMagicItemRarityLabel(item.rarity) }] : []),
    ...(item.requiresAttunement !== undefined
      ? [{ label: 'Attunement', value: item.requiresAttunement ? 'Required' : 'None' }]
      : []),
    ...(item.attunementRequirement
      ? [{ label: 'Attunement requirement', value: item.attunementRequirement }]
      : []),
    ...(item.magicItemCategory
      ? [{ label: 'Category', value: getMagicItemCategoryLabel(item.magicItemCategory) }]
      : []),
  ]
}

/** Kind-specific stat rows for unified equipment detail (excludes kind and cost). */
export function getEquipmentKindStatRows(item: Equipment): StatRow[] {
  if (isWeaponEquipment(item)) return getWeaponStatRows(item).filter((row) => row.label !== 'Cost')
  if (isArmorEquipment(item)) return getArmorStatRows(item).filter((row) => row.label !== 'Cost')

  switch (item.kind) {
    case 'adventuring_gear':
      return getAdventuringGearStatRows(item)
    case 'tool':
      return getToolStatRows(item)
    case 'mount':
      return getMountStatRows(item)
    case 'vehicle':
      return getVehicleStatRows(item)
    case 'service':
      return getServiceStatRows(item)
    case 'magic_item':
      return getMagicItemStatRows(item)
  }
}
