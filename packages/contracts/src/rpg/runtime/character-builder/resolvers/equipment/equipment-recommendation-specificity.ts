import type { EquipmentRecommendationSpecificity } from '../../../../content/equipment-recommendation'
import type { EquipmentRecommendationSelector } from './equipment-recommendation-selector'

/** Maps pool expansion size to browse specificity (exact / narrow / broad). */
export function specificityForMatchCount(matchCount: number): EquipmentRecommendationSpecificity {
  if (matchCount <= 1) return 'exact'
  if (matchCount <= 5) return 'narrow_pool'
  return 'broad_pool'
}

/** Classifies selector-derived contributions from catalog expansion size. */
export function specificityForSelectorExpansion(
  selector: EquipmentRecommendationSelector,
  matchCount: number,
): EquipmentRecommendationSpecificity {
  if (selector.kind === 'equipment') return 'exact'
  return specificityForMatchCount(matchCount)
}
