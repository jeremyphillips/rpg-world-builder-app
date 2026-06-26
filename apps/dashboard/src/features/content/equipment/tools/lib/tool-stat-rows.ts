import {
  formatToolUtilizes,
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
    { label: 'Ability', value: getAbilityLabel(item.ability) },
    { label: 'Utilize', value: formatToolUtilizes(item.utilizes) },
    ...(item.crafts?.length ? [{ label: 'Craft', value: item.crafts.join(', ') }] : []),
    ...(item.weight ? [{ label: 'Weight', value: formatWeight(item.weight) }] : []),
  ]
}
