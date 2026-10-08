import type { SearchDocument } from '@rpg/search/types'

import type { Equipment } from '../../../../content/equipment'
import type { EquipmentRecommendation } from '../../../../content/equipment-recommendation'
import type { EquipmentPickerBrowseSortContext } from './equipment-picker-browse-sort-context'
import { compareIntentionalEquipmentRanking } from '../equipment/equipment-ranking-policy'
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
   * Fits remaining budget and is for sale. Derived from `purchaseAvailability.status === 'available'`.
   * When no budget applies, priced rows stay available.
   */
  isWithinRemainingBudget: boolean
  /** Wealth-aware purchase gate for quantity=1. Remaining budget decides unaffordable. */
  purchaseAvailability: EquipmentPurchaseAvailability
  /** Tiered classification; `isRecommended` mirrors essential/strong recommendation tiers. */
  recommendation: EquipmentRecommendation
  /** Contributing evidence, including typed sources. Proficiency rows omit `source`. */
  evidence?: readonly SourcedEquipmentRecommendationEvidence[]
  /** Split requirement, soft recommendation, and option-state facts. */
  resolved?: ResolvedEquipmentOption
  /** Populated in magic-items workflow only. Row action chrome; browse order does not read it. */
  magicItemAction?: MagicItemActionState
}

export type EquipmentPickerItem = {
  equipment: Equipment
  state: EquipmentPickerItemState
  /** Populated by dashboard assembly before picker surfaces consume the row. */
  searchDocument?: SearchDocument
}

/**
 * Best-match browse order from resolved equipment facts: requirement match,
 * recommendation strength, specificity and source, then not-for-sale and proficiency
 * when the browse context enables them, then canonical kind and name.
 * Selection, remaining budget, and package choice do not reorder rows.
 */
export function compareEquipmentPickerItemsByRecommendation(
  left: EquipmentPickerItem,
  right: EquipmentPickerItem,
  context?: EquipmentPickerBrowseSortContext,
): number {
  return compareIntentionalEquipmentRanking(left, right, context)
}
