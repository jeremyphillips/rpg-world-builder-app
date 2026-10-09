import type {
  EquipmentRecommendationReason,
  EquipmentRecommendationSpecificity,
} from '../../../content/equipment-recommendation'
import type { UnmetAbilityScoreRequirement } from '../../../content/lib/ability-score-requirements'
import type { CharacterSelectionSource } from '../../character/sheet/selection-sources'

import type { RecommendationSourceRef } from './recommendation-source-ref'

/** Ranking-only proficiency provenance. Not an equipment reason and not a badge. */
export const ABILITY_FIT_RECOMMENDATION_REASON = 'abilityFit' as const

export const PROFICIENCY_RECOMMENDATION_REASONS = [ABILITY_FIT_RECOMMENDATION_REASON] as const

export type ProficiencyRecommendationReason = (typeof PROFICIENCY_RECOMMENDATION_REASONS)[number]

export type RecommendationSignalReason =
  | EquipmentRecommendationReason
  | ProficiencyRecommendationReason

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
  /**
   * Evidence reason that produced this recommendation signal.
   * Used for provenance and presentation policy. It does not determine rank directly.
   * `abilityFit` is ranking evidence only and must not become recommendation guidance.
   * `startingEquipment` here means the strength originated from starting-equipment
   * evidence, not that the item is in the currently selected package.
   */
  reason?: RecommendationSignalReason
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

/**
 * Per-option requirement fact. `optionSatisfies` stays true for every eligible option.
 * `candidate` is an unsatisfied lift; `satisfier` is an option that currently fulfills it;
 * `eligible` still satisfies the rule after another option has fulfilled it, without the lift.
 */
export type OptionRequirement = {
  requirementId: string
  owner: RecommendationSourceRef
  rule: RequirementRule
  /** This option could satisfy the requirement. Does not imply the requirement is unsatisfied. */
  optionSatisfies: true
  role: 'candidate' | 'satisfier' | 'eligible'
}

/**
 * Supply provenance for a live equipment row.
 * Legacy `npcTemplate` records are adapted to `role` / `role-default` before they reach this type.
 */
export type EquipmentSupplySource =
  | { kind: 'manual' }
  | { kind: 'role'; id: string }
  | { kind: 'role-default'; id: string }
  | { kind: 'recorded'; source: CharacterSelectionSource }

/** Live inclusion for one equipment option. Recommendation facts stay on {@link OptionRecommendation}. */
export type EquipmentOptionSelection = {
  selected: boolean
  quantity: number
  canAddMore: boolean
  removable: boolean
  sources: readonly EquipmentSupplySource[]
}

export type OptionState = {
  /** Present in the owned loadout (package, nested picks, grants, purchases). */
  owned?: boolean
  selection?: EquipmentOptionSelection
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
    /** Authored minimums the draft's known scores do not meet. Unknown scores are skipped. */
    unmetAbilityScoreRequirements?: readonly UnmetAbilityScoreRequirement[]
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
