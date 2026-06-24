import { formatWeight, type MountEquipment } from '@rpg/contracts'

import type { ContentStatRowData } from '../../../lib/content-stat-rows'

/** Stat rows for mount equipment detail (excludes kind and cost). */
export function getMountStatRows(item: MountEquipment): ContentStatRowData[] {
  return [
    { label: 'Carrying capacity', value: formatWeight(item.carryingCapacity) },
    ...(item.speed ? [{ label: 'Speed', value: item.speed }] : []),
  ]
}
