import type { Equipment } from '../../../../content/equipment'
import {
  isRecommendedEquipmentTier,
  NEUTRAL_EQUIPMENT_RECOMMENDATION,
  type EquipmentRecommendation,
} from '../../../../content/equipment-recommendation'
import type { CharacterProficiencies } from '../../../character/sheet/proficiencies'
import type { SourcedEquipmentRecommendationEvidence } from './equipment-recommendation-evidence'
import type { ResolvedEquipmentOption } from './project-equipment-option-facts'
import type { EquipmentPickerItem } from '../picker/equipment-picker-item'
import { isEquipmentPickerSupportedKind } from '../picker/equipment-picker-supported-kinds'
import type { EquipmentBudgetSummary } from './equipment-budget'
import { isEquipmentProficient } from './is-equipment-proficient'
import { resolveEquipmentPurchaseAvailability } from './resolve-equipment-purchase-availability'

export type ResolveEquipmentPickerItemsArgs = {
  equipment: readonly Equipment[]
  proficiencies: CharacterProficiencies
  /** Tiered classifications from `deriveEquipmentRecommendations`, keyed by equipment id. */
  recommendations: {
    get(equipmentId: string):
      | (EquipmentRecommendation & {
          evidence?: readonly SourcedEquipmentRecommendationEvidence[]
          resolved?: ResolvedEquipmentOption
        })
      | undefined
  }
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
      const derived = recommendations.get(row.id)
      const recommendation = derived ?? NEUTRAL_EQUIPMENT_RECOMMENDATION
      const purchaseAvailability = resolveEquipmentPurchaseAvailability({
        equipment: row,
        budget,
      })
      const resolved = derived?.resolved ? { ...derived.resolved, purchaseAvailability } : undefined

      return {
        equipment: row,
        state: {
          isAvailable: true,
          isRecommended: isRecommendedEquipmentTier(recommendation.tier),
          isProficient: isEquipmentProficient(row, proficiencies),
          isWithinRemainingBudget: purchaseAvailability.status === 'available',
          purchaseAvailability,
          recommendation,
          evidence: derived?.evidence ?? [],
          ...(resolved ? { resolved } : {}),
          disabledReasons: [],
        },
      }
    })
}
