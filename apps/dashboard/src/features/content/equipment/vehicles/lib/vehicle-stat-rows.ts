import {
  formatMass,
  formatSpeedRate,
  getVehicleCategoryLabel,
  VEHICLE_CARGO_CAPACITY_LABEL,
  type VehicleEquipment,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../../lib/content-stat-rows'

/** Stat rows for vehicle equipment detail (excludes kind and cost). */
export function getVehicleStatRows(item: VehicleEquipment): ContentStatRowData[] {
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
    ...(item.ac !== undefined ? [{ label: 'AC', value: String(item.ac) }] : []),
    ...(item.hp !== undefined ? [{ label: 'HP', value: String(item.hp) }] : []),
    ...(item.damageThreshold !== undefined
      ? [{ label: 'Damage threshold', value: String(item.damageThreshold) }]
      : []),
  ]
}
