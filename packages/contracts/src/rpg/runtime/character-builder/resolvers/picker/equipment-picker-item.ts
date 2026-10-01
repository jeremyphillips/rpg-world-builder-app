import type { SearchDocument } from '@rpg/search/types'

import type { Equipment } from '../../../../content/equipment'
import {
  compareEquipmentRecommendationSpecificity,
  compareEquipmentRecommendationTiers,
  getBestEquipmentRecommendationReasonRank,
  type EquipmentRecommendation,
} from '../../../../content/equipment-recommendation'
import type { EquipmentPickerBrowseSortContext } from './equipment-picker-browse-sort-context'
import { compareIntentionalEquipmentRanking } from '../equipment/equipment-ranking-policy'
import { getEquipmentRecommendationKindRank } from './equipment-picker-item-kind-rank'
import { getEquipmentWeaponCategoryBrowseRank } from './equipment-picker-item-weapon-category-rank'
import type { SourcedEquipmentRecommendationEvidence } from '../equipment/equipment-recommendation-evidence'
import type { ResolvedEquipmentOption } from '../equipment/project-equipment-option-facts'
import type { EquipmentPurchaseAvailability } from '../equipment/resolve-equipment-purchase-availability'
import type { MagicItemActionState } from './magic-item-picker-action-rank'
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
  /** Wealth-aware purchase gate for quantity=1 — null cost is unavailable, never unaffordable. */
  purchaseAvailability: EquipmentPurchaseAvailability
  /** Tiered classification; `isRecommended` mirrors essential/strong recommendation tiers. */
  recommendation: EquipmentRecommendation
  /** Contributing evidence, including typed sources. Proficiency rows omit `source`. */
  evidence?: readonly SourcedEquipmentRecommendationEvidence[]
  /** Split requirement, soft recommendation, and option-state facts. */
  resolved?: ResolvedEquipmentOption
  /** Populated in magic-items workflow only — drives actionability best-match rank. */
  magicItemAction?: MagicItemActionState
}

export type EquipmentPickerItem = {
  equipment: Equipment
  state: EquipmentPickerItemState
  /** Populated by dashboard assembly before picker surfaces consume the row. */
  searchDocument?: SearchDocument
}

/**
 * Stable picker browse ordering. Rows with split facts use the equipment ranking policy:
 * unsatisfied requirements, active-choice relevance, soft strength, specificity, source
 * tie-break, then canonical order. Rows without facts keep the legacy tier/reason order.
 * Search stays text-score-first; an empty query preserves this order.
 */
export function compareEquipmentPickerItemsByRecommendation(
  left: EquipmentPickerItem,
  right: EquipmentPickerItem,
  context?: EquipmentPickerBrowseSortContext,
): number {
  if (context?.rankingMode !== 'parity' && left.state.resolved && right.state.resolved) {
    return compareIntentionalEquipmentRanking(left, right, context)
  }

  return compareLegacyEquipmentPickerItems(left, right, context)
}

/** Pre-split browse order: tier, specificity, reason, then canonical tie-breaks. */
export function compareLegacyEquipmentPickerItems(
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
