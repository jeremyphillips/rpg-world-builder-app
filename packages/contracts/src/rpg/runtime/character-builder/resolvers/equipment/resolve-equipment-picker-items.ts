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
import { resolveEquipmentPurchasePricing } from './resolve-equipment-purchase-pricing'

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
  /** Max starting purse across available packages, in copper. Spent gold is already excluded. */
  purchaseBudgetCeilingCp?: number
}

/** Annotates available equipment rows with orthogonal picker state for the drawer. */
export function resolveEquipmentPickerItems({
  equipment,
  proficiencies,
  recommendations,
  budget,
  purchaseBudgetCeilingCp,
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
      const exceedsPurchaseBudgetCeiling = priceExceedsPurchaseBudgetCeiling(
        row,
        purchaseBudgetCeilingCp,
      )
      const resolved = derived?.resolved
        ? { ...derived.resolved, purchaseAvailability, exceedsPurchaseBudgetCeiling }
        : undefined

      return {
        equipment: row,
        state: {
          isAvailable: true,
          isRecommended: isRecommendedEquipmentTier(recommendation.tier),
          isProficient: isEquipmentProficient(row, proficiencies),
          isWithinRemainingBudget: purchaseAvailability.status === 'available',
          purchaseAvailability,
          exceedsPurchaseBudgetCeiling,
          recommendation,
          evidence: derived?.evidence ?? [],
          ...(resolved ? { resolved } : {}),
          disabledReasons: [],
        },
      }
    })
}

function priceExceedsPurchaseBudgetCeiling(
  equipment: Equipment,
  purchaseBudgetCeilingCp: number | undefined,
): boolean {
  if (purchaseBudgetCeilingCp === undefined) return false
  const pricing = resolveEquipmentPurchasePricing(equipment)
  if (pricing.status !== 'priced') return false
  return pricing.unitCostCp > purchaseBudgetCeilingCp
}
