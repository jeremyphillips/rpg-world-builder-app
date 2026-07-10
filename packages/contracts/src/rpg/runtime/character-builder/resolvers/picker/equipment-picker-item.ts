import type { Equipment } from '../../../../content/equipment'
import {
  compareEquipmentRecommendationTiers,
  type EquipmentRecommendation,
} from '../../../../content/equipment-recommendation'
import type { PickerItemStateBase } from './picker-item-state'

export type EquipmentPickerItemState = PickerItemStateBase & {
  isProficient: boolean
  isAffordable: boolean
  /** Tiered classification; `isRecommended` mirrors Recommended-tab membership (essential/strong). */
  recommendation: EquipmentRecommendation
}

export type EquipmentPickerItem = {
  equipment: Equipment
  state: EquipmentPickerItemState
  searchText: string
}

/** Stable picker ordering: recommendation tier first, then name. */
export function compareEquipmentPickerItemsByRecommendation(
  left: EquipmentPickerItem,
  right: EquipmentPickerItem,
): number {
  const tierOrder = compareEquipmentRecommendationTiers(
    left.state.recommendation.tier,
    right.state.recommendation.tier,
  )
  if (tierOrder !== 0) return tierOrder
  return left.equipment.name.localeCompare(right.equipment.name)
}
