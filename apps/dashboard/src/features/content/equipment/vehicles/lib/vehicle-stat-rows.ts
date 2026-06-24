import { formatWeight, getVehicleCategoryLabel, type VehicleEquipment } from '@rpg/contracts'

import type { ContentStatRowData } from '../../../lib/content-stat-rows'

/** Stat rows for vehicle equipment detail (excludes kind and cost). */
export function getVehicleStatRows(item: VehicleEquipment): ContentStatRowData[] {
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
