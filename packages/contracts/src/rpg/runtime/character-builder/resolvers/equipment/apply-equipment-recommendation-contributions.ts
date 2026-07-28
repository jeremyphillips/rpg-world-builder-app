import type { CharacterBuildCatalogIndex } from '../../context'
import {
  addRecommendationContribution,
  type AccumulatorMap,
} from './equipment-recommendation-accumulator'
import type { EquipmentRecommendationContribution } from './equipment-recommendation-contribution'
import { expandRecommendationSelector } from './equipment-recommendation-selector'
import { specificityForSelectorExpansion } from './equipment-recommendation-specificity'

function applyContribution(
  accumulators: AccumulatorMap,
  contribution: EquipmentRecommendationContribution,
  catalogIndex: CharacterBuildCatalogIndex,
  rulesetId: string,
): void {
  const matches = expandRecommendationSelector({
    selector: contribution.selector,
    equipment: catalogIndex.equipment,
    rulesetId,
  })
  const specificity = specificityForSelectorExpansion(contribution.selector, matches.length)

  for (const equipment of matches) {
    if (contribution.excludeEquipmentIds?.has(equipment.id)) continue

    addRecommendationContribution(
      accumulators,
      equipment.id,
      contribution.tier,
      contribution.reason,
      contribution.sourceKey,
      specificity,
    )
  }
}

export function applyRecommendationContributions(args: {
  accumulators: AccumulatorMap
  contributions: readonly EquipmentRecommendationContribution[]
  catalogIndex: CharacterBuildCatalogIndex
  rulesetId: string
}): void {
  const { accumulators, contributions, catalogIndex, rulesetId } = args

  for (const contribution of contributions) {
    applyContribution(accumulators, contribution, catalogIndex, rulesetId)
  }
}
