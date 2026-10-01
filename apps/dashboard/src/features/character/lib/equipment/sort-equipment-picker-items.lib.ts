import {
  compareEquipmentPickerItemsByRecommendation,
  type EquipmentPickerItem,
} from '@rpg/contracts'

import type { EquipmentPickerRecommendationContext } from './equipment-picker-recommendation-context.lib'

export function sortEquipmentPickerItems(
  items: readonly EquipmentPickerItem[],
  browseSortContext: EquipmentPickerRecommendationContext['browseSortContext'],
): EquipmentPickerItem[] {
  return [...items].sort((left, right) =>
    compareEquipmentPickerItemsByRecommendation(left, right, browseSortContext),
  )
}
