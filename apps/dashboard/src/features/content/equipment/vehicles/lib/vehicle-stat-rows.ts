import {
  armorClassFromProtection,
  formatMass,
  formatSpeedRate,
  getVehicleCategoryLabel,
  VEHICLE_CARGO_CAPACITY_LABEL,
  type ArmorClassRules,
  type VehicleEquipment,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../../lib/detail/metadata/content-stat-rows'

/** Stat rows for vehicle equipment detail (excludes kind and cost). */
export function getVehicleStatRows(
  item: VehicleEquipment,
  rules: ArmorClassRules,
): ContentStatRowData[] {
  return [
    { label: 'Category', value: getVehicleCategoryLabel(item.vehicleCategory) },
    { label: 'Speed', value: formatSpeedRate(item.speed) },
    ...(item.cargoCapacity
      ? [{ label: VEHICLE_CARGO_CAPACITY_LABEL, value: formatMass(item.cargoCapacity) }]
      : []),
    ...(item.crew !== undefined ? [{ label: 'Crew', value: String(item.crew) }] : []),
    ...(item.passengers !== undefined
      ? [{ label: 'Passengers', value: String(item.passengers) }]
      : []),
    ...(item.acOffset !== undefined
      ? [{ label: 'AC', value: String(armorClassFromProtection(rules, item.acOffset)) }]
      : []),
    ...(item.hp !== undefined ? [{ label: 'HP', value: String(item.hp) }] : []),
    ...(item.damageThreshold !== undefined
      ? [{ label: 'Damage threshold', value: String(item.damageThreshold) }]
      : []),
  ]
}
