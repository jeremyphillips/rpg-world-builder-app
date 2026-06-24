import {
  formatMass,
  formatSpeedRate,
  MOUNT_CARRYING_CAPACITY_LABEL,
  type MountEquipment,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../../lib/content-stat-rows'

/** Stat rows for mount equipment detail (excludes kind and cost). */
export function getMountStatRows(item: MountEquipment): ContentStatRowData[] {
  return [
    { label: MOUNT_CARRYING_CAPACITY_LABEL, value: formatMass(item.carryingCapacity) },
    { label: 'Speed', value: formatSpeedRate(item.speed) },
  ]
}
