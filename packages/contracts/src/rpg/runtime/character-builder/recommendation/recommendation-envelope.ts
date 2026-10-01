import type { EquipmentRecommendationSpecificity } from '../../../content/equipment-recommendation'
import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'

import type { RecommendationSourceRef } from './recommendation-source-ref'

/** Soft only. A requirement is never a recommendation strength. */
export const RECOMMENDATION_STRENGTHS = ['strong', 'compatible', 'neutral', 'discouraged'] as const

export type RecommendationStrength = (typeof RECOMMENDATION_STRENGTHS)[number]

export const RECOMMENDATION_STRENGTH_RANK = {
  strong: 0,
  compatible: 1,
  neutral: 2,
  discouraged: 3,
} as const satisfies Record<RecommendationStrength, number>

export const RECOMMENDATION_SIGNAL_BASES = [
  'authored',
  'preference',
  'affinity',
  'inferred',
] as const

export type RecommendationSignalBasis = (typeof RECOMMENDATION_SIGNAL_BASES)[number]

export type RecommendationSpecificity = EquipmentRecommendationSpecificity

export type RecommendationSignal = {
  strength: Exclude<RecommendationStrength, 'neutral'>
  basis: RecommendationSignalBasis
  /** Absent for source-less facts such as proficiency compatibility. */
  source?: RecommendationSourceRef
  specificity: RecommendationSpecificity
  detail?: RecommendationSignalDetail
}

export type RecommendationSignalDetail = {
  kind: 'toolCategory'
  toolCategory: string
}

export type OptionRecommendation = {
  /** Strongest signal. Source count never promotes strength. */
  strength: RecommendationStrength
  signals: readonly RecommendationSignal[]
}

export type RequirementRule = 'exact' | 'anyOf'

export type RequirementDefinition = {
  requirementId: string
  owner: RecommendationSourceRef
  rule: RequirementRule
  optionGroupId?: string
  eligibleOptionIds: readonly string[]
  detail?: RequirementDetail
}

export type RequirementDetail = {
  kind: 'spellcastingFocus'
}

export type RequirementState = {
  requirementId: string
  satisfied: boolean
  satisfiedBy: readonly string[]
}

/** Per-option view. Unsatisfied pool members are candidates; other candidates disappear once satisfied. */
export type OptionRequirement = {
  requirementId: string
  owner: RecommendationSourceRef
  rule: RequirementRule
  role: 'candidate' | 'satisfier'
}

export type OptionState = {
  selection?: {
    selected: boolean
    quantity?: number
    grants: CharacterSelectionSource[]
    removable: boolean
    reselectable: boolean
  }
  choice?: {
    choiceSetId?: string
    inOpenPool: boolean
    inSelectedPackage: boolean
    inAlternativePackage: boolean
  }
  compatibility?: {
    proficient?: boolean
    proficiencySources?: readonly CharacterSelectionSource[]
    spellcastingFocusFor?: RecommendationSourceRef
  }
}

export type ActiveChoiceContext =
  | { kind: 'none' }
  | { kind: 'pool'; choiceSetId: string }
  | { kind: 'package'; choiceSetId: string }
  | { kind: 'requirement'; requirementId: string }
  | { kind: 'allowance'; allowanceId: string }

export const OPTION_CONTEXT_RELEVANCE = ['activeTarget', 'related', 'none'] as const

export type OptionContextRelevance = (typeof OPTION_CONTEXT_RELEVANCE)[number]

export const OPTION_CONTEXT_RELEVANCE_RANK = {
  activeTarget: 0,
  related: 1,
  none: 2,
} as const satisfies Record<OptionContextRelevance, number>

export const NEUTRAL_OPTION_RECOMMENDATION: OptionRecommendation = {
  strength: 'neutral',
  signals: [],
}
