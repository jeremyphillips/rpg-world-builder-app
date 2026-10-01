import type {
  EquipmentRecommendationReason,
  EquipmentRecommendationTier,
} from '../../../../content/equipment-recommendation'
import type { RecommendationSignalBasis, RecommendationSourceRef } from '../../recommendation'
import type { EquipmentRecommendationSelector } from './equipment-recommendation-selector'

export type EquipmentRecommendationContribution = {
  selector: EquipmentRecommendationSelector
  tier: EquipmentRecommendationTier
  reason: EquipmentRecommendationReason
  /** Distinguishes slots that share a recommendation source, such as two package rows. */
  dedupeKey: string
  source?: RecommendationSourceRef
  basis?: RecommendationSignalBasis
  choiceSetId?: string
  excludeEquipmentIds?: ReadonlySet<string>
}

/** Controls tier/reason when deriving starting-equipment shopping guidance. */
export type StartingEquipmentContributionContext =
  | 'unselected_option'
  | 'selected_package'
  | 'gold_alternative'
