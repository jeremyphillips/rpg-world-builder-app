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
  selectedClassId: string | undefined,
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
      specificity,
      {
        ...(contribution.source ? { source: contribution.source } : {}),
        ...(contribution.scope ? { scope: contribution.scope } : {}),
        ...(contribution.basis ? { basis: contribution.basis } : {}),
        ...(contribution.choiceSetId ? { choiceSetId: contribution.choiceSetId } : {}),
        ...(selectedClassId ? { selectedClassId } : {}),
      },
    )
  }
}

export function applyRecommendationContributions(args: {
  accumulators: AccumulatorMap
  contributions: readonly EquipmentRecommendationContribution[]
  catalogIndex: CharacterBuildCatalogIndex
  rulesetId: string
  selectedClassId?: string
}): void {
  const { accumulators, contributions, catalogIndex, rulesetId, selectedClassId } = args

  for (const contribution of contributions) {
    applyContribution(accumulators, contribution, catalogIndex, rulesetId, selectedClassId)
  }
}
