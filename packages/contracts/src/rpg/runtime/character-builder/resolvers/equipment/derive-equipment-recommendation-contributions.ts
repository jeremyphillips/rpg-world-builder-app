export type {
  EquipmentRecommendationContribution,
  StartingEquipmentContributionContext,
} from './equipment-recommendation-contribution'

export {
  categoryOnlyToolProficiencyPool,
  deriveProficiencyRecommendationContributions,
  hasUnfulfilledCategoryEquipmentNeed,
  isGoldShoppingPath,
  poolHasSemanticCategories,
  selectedPackageGrantsMatchingToolCategories,
  selectedPackageResolvesMatchingEquipmentChoice,
} from './derive-proficiency-recommendation-contributions'

export {
  deriveStartingEquipmentRecommendationContributions,
  listSelectedStartingEquipmentGrantIds,
} from './derive-starting-equipment-recommendation-contributions'

export { applyRecommendationContributions } from './apply-equipment-recommendation-contributions'
