import {
  formatWeight,
  getAbilityLabel,
  getToolCategoryLabel,
  type ToolEquipment,
} from '@rpg/contracts'

import type { ContentStatRowData } from '../../../lib/content-stat-rows'

/** Stat rows for tool equipment detail (excludes kind and cost). */
export function getToolStatRows(item: ToolEquipment): ContentStatRowData[] {
  return [
    { label: 'Category', value: getToolCategoryLabel(item.toolCategory) },
    ...(item.ability ? [{ label: 'Ability', value: getAbilityLabel(item.ability) }] : []),
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
  ]
}
