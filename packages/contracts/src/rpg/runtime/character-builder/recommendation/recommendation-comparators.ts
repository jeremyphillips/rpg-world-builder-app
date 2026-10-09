import {
  OPTION_CONTEXT_RELEVANCE_RANK,
  RECOMMENDATION_STRENGTH_RANK,
  type OptionContextRelevance,
  type OptionRecommendation,
  type OptionRequirement,
  type RecommendationSpecificity,
  type RecommendationStrength,
} from './recommendation-envelope'
import type { RecommendationSourceKind } from './recommendation-source-ref'

const SPECIFICITY_RANK: Record<RecommendationSpecificity, number> = {
  exact: 0,
  narrow_pool: 1,
  broad_pool: 2,
}

/** Provisional equipment tie-break. Applied only after strength and specificity. */
export const EQUIPMENT_RECOMMENDATION_SOURCE_PRIORITY = [
  'user',
  'title',
  'role',
  'class',
  'subclass',
  'organization',
  'species',
  'origin',
  'feat',
] as const satisfies readonly RecommendationSourceKind[]

export function compareActiveRequirement(
  left: readonly OptionRequirement[],
  right: readonly OptionRequirement[],
): number {
  return requirementMatchRank(left) - requirementMatchRank(right)
}

function requirementMatchRank(requirements: readonly OptionRequirement[]): number {
  const matches = requirements.filter((requirement) => requirement.optionSatisfies)
  if (matches.some((requirement) => requirement.rule === 'exact')) return 0
  if (matches.some((requirement) => requirement.rule === 'anyOf')) return 1
  return 2
}

export function compareContextRelevance(
  left: OptionContextRelevance,
  right: OptionContextRelevance,
): number {
  return OPTION_CONTEXT_RELEVANCE_RANK[left] - OPTION_CONTEXT_RELEVANCE_RANK[right]
}

export function compareStrength(
  left: RecommendationStrength | OptionRecommendation,
  right: RecommendationStrength | OptionRecommendation,
): number {
  const leftStrength = typeof left === 'string' ? left : left.strength
  const rightStrength = typeof right === 'string' ? right : right.strength
  return RECOMMENDATION_STRENGTH_RANK[leftStrength] - RECOMMENDATION_STRENGTH_RANK[rightStrength]
}

export function compareSpecificity(
  left: RecommendationSpecificity,
  right: RecommendationSpecificity,
): number {
  return SPECIFICITY_RANK[left] - SPECIFICITY_RANK[right]
}

export function compareSourcePriority(
  left: RecommendationSourceKind | undefined,
  right: RecommendationSourceKind | undefined,
  priority: readonly RecommendationSourceKind[] = EQUIPMENT_RECOMMENDATION_SOURCE_PRIORITY,
): number {
  return sourcePriorityRank(left, priority) - sourcePriorityRank(right, priority)
}

function sourcePriorityRank(
  kind: RecommendationSourceKind | undefined,
  priority: readonly RecommendationSourceKind[],
): number {
  if (!kind) return priority.length
  const index = priority.indexOf(kind)
  return index === -1 ? priority.length : index
}

export function compareCanonical(leftName: string, rightName: string): number {
  return leftName.localeCompare(rightName, undefined, { sensitivity: 'base' })
}
