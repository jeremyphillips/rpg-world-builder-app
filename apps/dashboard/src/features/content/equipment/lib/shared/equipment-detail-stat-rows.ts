import type { Equipment } from '@rpg/contracts'
import {
  formatWeight,
  getGearKindLabel,
  getVehicleCategoryLabel,
  isArmorEquipment,
  isWeaponEquipment,
} from '@rpg/contracts'

import { getArmorStatRows } from '../../../armor/lib/armor-stat-rows'
import type { ContentStatRowData } from '../../../lib/content-stat-rows'
import { getWeaponStatRows } from '../../../weapons/lib/weapon-stat-rows'
import { getServiceStatRows } from '../../services/lib/service-stat-rows'
import { getMountStatRows } from '../../mounts/lib/mount-stat-rows'
import { getToolStatRows } from '../../tools/lib/tool-stat-rows'
import { getMagicItemStatRows } from '../../magic-items/lib/magic-item-stat-rows'

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
