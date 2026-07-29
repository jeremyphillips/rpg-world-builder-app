import type { Equipment } from '../../../../content/equipment'
import {
  isRecommendedEquipmentTier,
  NEUTRAL_EQUIPMENT_RECOMMENDATION,
  type EquipmentRecommendation,
} from '../../../../content/equipment-recommendation'
import type { CharacterProficiencies } from '../../../character/proficiencies'
import type { EquipmentPickerItem } from '../picker/equipment-picker-item'
import { isEquipmentPickerSupportedKind } from '../picker/equipment-picker-supported-kinds'
import type { EquipmentBudgetSummary } from './equipment-budget'
import { isEquipmentAffordableAtStartingBudget } from './equipment-budget'
import { isEquipmentProficient } from './is-equipment-proficient'
import { resolveEquipmentPurchaseAvailability } from './resolve-equipment-purchase-availability'

export type ResolveEquipmentPickerItemsArgs = {
  equipment: readonly Equipment[]
  proficiencies: CharacterProficiencies
  /** Tiered classifications from `deriveEquipmentRecommendations`, keyed by equipment id. */
  recommendations: ReadonlyMap<string, EquipmentRecommendation>
  budget?: EquipmentBudgetSummary
}

/** Annotates available equipment rows with orthogonal picker state for the drawer. */
export function resolveEquipmentPickerItems({
  equipment,
  proficiencies,
  recommendations,
  budget,
}: ResolveEquipmentPickerItemsArgs): EquipmentPickerItem[] {
  return equipment
    .filter((row) => isEquipmentPickerSupportedKind(row.kind))
    .map((row) => {
      const recommendation = recommendations.get(row.id) ?? NEUTRAL_EQUIPMENT_RECOMMENDATION
      const purchaseAvailability = resolveEquipmentPurchaseAvailability({
        equipment: row,
        budget,
      })

      return {
        equipment: row,
        state: {
          isAvailable: true,
          isRecommended: isRecommendedEquipmentTier(recommendation.tier),
          isProficient: isEquipmentProficient(row, proficiencies),
          isAffordable: budget ? isEquipmentAffordableAtStartingBudget(row, budget) : true,
          isWithinRemainingBudget: purchaseAvailability.status === 'available',
          purchaseAvailability,
          recommendation,
          disabledReasons: [],
        },
      }
    })
}
