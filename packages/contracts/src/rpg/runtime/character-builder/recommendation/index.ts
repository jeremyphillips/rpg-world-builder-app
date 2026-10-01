export type { RecommendationSourceKind, RecommendationSourceRef } from './recommendation-source-ref'
export { RECOMMENDATION_SOURCE_KINDS } from './recommendation-source-ref'

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
