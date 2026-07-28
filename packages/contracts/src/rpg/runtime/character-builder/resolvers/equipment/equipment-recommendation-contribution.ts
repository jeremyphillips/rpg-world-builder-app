import type {
  EquipmentRecommendationReason,
  EquipmentRecommendationTier,
} from '../../../../content/equipment-recommendation'
import type { EquipmentRecommendationSelector } from './equipment-recommendation-selector'

export type EquipmentRecommendationContribution = {
  selector: EquipmentRecommendationSelector
  tier: EquipmentRecommendationTier
  reason: EquipmentRecommendationReason
  sourceKey: string
  excludeEquipmentIds?: ReadonlySet<string>
}

/** Controls tier/reason when deriving starting-equipment shopping guidance. */
export type StartingEquipmentContributionContext =
  | 'unselected_option'
  | 'selected_package'
  | 'gold_alternative'
