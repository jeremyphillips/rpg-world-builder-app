import {
  formatHolySymbolUsage,
  formatWeight,
  getGearKindLabel,
  type AdventuringGearEquipment,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../../lib/content-stat-rows'

/** Stat rows for adventuring gear equipment detail (excludes kind and cost). */
export function getAdventuringGearStatRows(item: AdventuringGearEquipment): ContentStatRowData[] {
  return [
    { label: 'Gear kind', value: getGearKindLabel(item.gearKind) },
    ...(item.holySymbolUsage?.length
      ? [{ label: 'Holy symbol usage', value: formatHolySymbolUsage(item.holySymbolUsage) }]
      : []),
    ...(item.alsoWeaponSlug
      ? [{ label: 'Also weapon', value: item.alsoWeaponSlug }]
      : []),
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
