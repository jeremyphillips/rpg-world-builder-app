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
import {
  isEquipmentAffordableAtStartingBudget,
  isEquipmentWithinRemainingBudget,
} from './equipment-budget'
import { buildEquipmentPickerSearchText } from './format-equipment-picker-metadata'
import { isEquipmentProficient } from './is-equipment-proficient'

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

      return {
        equipment: row,
        searchText: buildEquipmentPickerSearchText(row),
        state: {
          isAvailable: true,
          isRecommended: isRecommendedEquipmentTier(recommendation.tier),
          isProficient: isEquipmentProficient(row, proficiencies),
          isAffordable: budget ? isEquipmentAffordableAtStartingBudget(row, budget) : true,
          isWithinRemainingBudget: budget ? isEquipmentWithinRemainingBudget(row, budget) : true,
          recommendation,
          disabledReasons: [],
        },
      }
    })
}
