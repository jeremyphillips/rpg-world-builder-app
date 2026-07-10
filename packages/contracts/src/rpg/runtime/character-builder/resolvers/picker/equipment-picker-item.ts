import type { Equipment } from '../../../../content/equipment'
import {
  compareEquipmentRecommendationSpecificity,
  compareEquipmentRecommendationTiers,
  getBestEquipmentRecommendationReasonRank,
  type EquipmentRecommendation,
} from '../../../../content/equipment-recommendation'
import type { EquipmentPickerBrowseSortContext } from './equipment-picker-browse-sort-context'
import { getEquipmentRecommendationKindRank } from './equipment-picker-item-kind-rank'
import { getEquipmentWeaponCategoryBrowseRank } from './equipment-picker-item-weapon-category-rank'
import type { PickerItemStateBase } from './picker-item-state'

export type { EquipmentPickerBrowseSortContext } from './equipment-picker-browse-sort-context'
export {
  characterPrefersMartialWeaponBrowseOrder,
  EQUIPMENT_RECOMMENDATION_WEAPON_CATEGORY_RANK,
} from './equipment-picker-item-weapon-category-rank'

export type EquipmentPickerItemState = PickerItemStateBase & {
  isProficient: boolean
  /**
   * UI shorthand: fits starting budget. When no budget applies, always `true` — budget
   * gating is inactive, not proof that a comparison ran.
   */
  isAffordable: boolean
  /**
   * Fits remaining budget after purchases. When no budget applies, always `true` — budget
   * gating is inactive, not proof that a comparison ran.
   */
  isWithinRemainingBudget: boolean
  /** Tiered classification; `isRecommended` mirrors Recommended-tab membership (essential/strong). */
  recommendation: EquipmentRecommendation
}

export type EquipmentPickerItem = {
  equipment: Equipment
  state: EquipmentPickerItemState
  searchText: string
}

/**
 * Stable picker browse ordering: tier → specificity → best reason → starting affordability
 * → kind bucket → weapon category → name. Search (`CatalogPickerSheet` / `rankItems`) stays
 * text-score-first; an empty query preserves this order. Kind and weapon-category ranks
 * are tiebreakers only after tier, specificity, reason, and affordability.
 */
export function compareEquipmentPickerItemsByRecommendation(
  left: EquipmentPickerItem,
  right: EquipmentPickerItem,
  context?: EquipmentPickerBrowseSortContext,
): number {
  const tierOrder = compareEquipmentRecommendationTiers(
    left.state.recommendation.tier,
    right.state.recommendation.tier,
  )
  if (tierOrder !== 0) return tierOrder

  const specificityOrder = compareEquipmentRecommendationSpecificity(
    left.state.recommendation.specificity,
    right.state.recommendation.specificity,
  )
  if (specificityOrder !== 0) return specificityOrder

  const leftReasonRank = getBestEquipmentRecommendationReasonRank(left.state.recommendation.reasons)
  const rightReasonRank = getBestEquipmentRecommendationReasonRank(
    right.state.recommendation.reasons,
  )
  if (leftReasonRank !== rightReasonRank) return leftReasonRank - rightReasonRank

  if (left.state.isAffordable !== right.state.isAffordable) {
    return left.state.isAffordable ? -1 : 1
  }

  const leftKindRank = getEquipmentRecommendationKindRank(left.equipment)
  const rightKindRank = getEquipmentRecommendationKindRank(right.equipment)
  if (leftKindRank !== rightKindRank) return leftKindRank - rightKindRank

  const preferMartial = context?.preferMartialWeaponBrowseOrder ?? false
  const leftWeaponCategoryRank = getEquipmentWeaponCategoryBrowseRank(left.equipment, preferMartial)
  const rightWeaponCategoryRank = getEquipmentWeaponCategoryBrowseRank(
    right.equipment,
    preferMartial,
  )
  if (leftWeaponCategoryRank !== rightWeaponCategoryRank) {
    return leftWeaponCategoryRank - rightWeaponCategoryRank
  }

  return left.equipment.name.localeCompare(right.equipment.name, undefined, {
    sensitivity: 'base',
  })
}
