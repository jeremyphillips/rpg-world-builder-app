export type { RecommendationSourceKind, RecommendationSourceRef } from './recommendation-source-ref'
export { RECOMMENDATION_SOURCE_KINDS } from './recommendation-source-ref'

export type { RecommendationScope } from './recommendation-scope'
export {
  GLOBAL_RECOMMENDATION_SCOPE,
  classRecommendationScope,
  recommendationScopeApplies,
  recommendationScopeIdentity,
} from './recommendation-scope'

export {
  formatRecommendationSourceLabel,
  RECOMMENDATION_SOURCE_LABEL_DENSITIES,
} from './format-recommendation-source-label'
export type {
  FormatRecommendationSourceLabelOptions,
  RecommendationSourceLabelDensity,
} from './format-recommendation-source-label'

export {
  formatSourceSuggestsSentence,
  formatSuggestedBySentence,
  SUGGESTED_BY_PREFIX,
} from './format-suggested-by'

export {
  npcRecommendationSourceKind,
  recommendationSourceRefFromDisplaySourceKind,
  recommendationSourceRefFromKind,
  recommendationSourceRefFromNpcRecommendationSource,
  recommendationSourceRefsFromNpcSources,
  recommendationSourceRefFromOrganizationClassSource,
  RECOMMENDATION_DISPLAY_SOURCE_KINDS,
} from './recommendation-source-adapters'
export type {
  RecommendationDisplaySourceKind,
  RecommendationSourceIdentity,
} from './recommendation-source-adapters'

export type {
  ActiveChoiceContext,
  OptionContextRelevance,
  EquipmentOptionSelection,
  EquipmentSupplySource,
  OptionRecommendation,
  OptionRequirement,
  OptionState,
  RecommendationSignal,
  RecommendationSignalBasis,
  RecommendationSignalDetail,
  RecommendationSpecificity,
  RecommendationStrength,
  RequirementDefinition,
  RequirementDetail,
  RequirementRule,
  RequirementState,
} from './recommendation-envelope'
export {
  NEUTRAL_OPTION_RECOMMENDATION,
  OPTION_CONTEXT_RELEVANCE,
  OPTION_CONTEXT_RELEVANCE_RANK,
  RECOMMENDATION_SIGNAL_BASES,
  RECOMMENDATION_STRENGTH_RANK,
  RECOMMENDATION_STRENGTHS,
} from './recommendation-envelope'

export {
  compareActiveRequirement,
  compareCanonical,
  compareContextRelevance,
  compareSourcePriority,
  compareSpecificity,
  compareStrength,
  EQUIPMENT_RECOMMENDATION_SOURCE_PRIORITY,
} from './recommendation-comparators'

export { resolveOptionContextRelevance } from './option-context-relevance'

export {
  grantedByLabel,
  includedQuantityLabel,
  OPTION_PRESENTATION_AVAILABLE_IN_STARTING_OPTION_LABEL,
  OPTION_PRESENTATION_COMMON_FOR_CLASS_LABEL,
  OPTION_PRESENTATION_DISCRIMINATORS,
  OPTION_PRESENTATION_FACT_KINDS,
  OPTION_PRESENTATION_IN_PACKAGE_LABEL,
  OPTION_PRESENTATION_NOT_PROFICIENT_LABEL,
  OPTION_PRESENTATION_PROFICIENCY_AVAILABLE_LABEL,
  OPTION_PRESENTATION_PROFICIENT_LABEL,
  OPTION_PRESENTATION_RECOMMENDED_LABEL,
  OPTION_PRESENTATION_SPELLCASTING_FOCUS_LABEL,
  OPTION_PRESENTATION_STARTING_OPTION_LABEL,
  recommendationSourceLabels,
  requiredByLabel,
  satisfiesFocusRequirementLabel,
  softRecommendationFact,
} from './resolve-option-presentation-facts'
export type {
  OptionPresentationDiscriminator,
  OptionPresentationFact,
  OptionPresentationFactKind,
  OptionPresentationFacts,
  RecommendationSourceName,
} from './resolve-option-presentation-facts'

export { resolveEquipmentPresentationFacts } from './resolve-equipment-presentation-facts'
export type { EquipmentOpenPoolKind } from './resolve-equipment-presentation-facts'
