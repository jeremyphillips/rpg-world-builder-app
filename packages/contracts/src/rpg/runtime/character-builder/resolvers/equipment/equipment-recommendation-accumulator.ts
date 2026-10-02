import {
  EQUIPMENT_RECOMMENDATION_SPECIFICITY_RANK,
  EQUIPMENT_RECOMMENDATION_TIER_RANK,
  EQUIPMENT_RECOMMENDATION_TIERS,
  getBestEquipmentRecommendationSpecificity,
  type EquipmentRecommendation,
  type EquipmentRecommendationReason,
  type EquipmentRecommendationSpecificity,
  type EquipmentRecommendationTier,
} from '../../../../content/equipment-recommendation'
import {
  classRecommendationScope,
  GLOBAL_RECOMMENDATION_SCOPE,
  recommendationScopeApplies,
  type RecommendationScope,
  type RecommendationSignalBasis,
  type RecommendationSourceRef,
} from '../../recommendation'
import type { ResolvedEquipmentOption } from './project-equipment-option-facts'
import type { SourcedEquipmentRecommendationEvidence } from './equipment-recommendation-evidence'
import { equipmentEvidenceIdentity } from './equipment-recommendation-evidence'

export type RecommendationAccumulator = {
  minRank: number
  minSpecificityRank: number
  reasons: Set<EquipmentRecommendationReason>
  evidence: SourcedEquipmentRecommendationEvidence[]
  label?: string
}

export type AccumulatorMap = Map<string, RecommendationAccumulator>

export type AddRecommendationContributionOptions = {
  source?: RecommendationSourceRef
  scope?: RecommendationScope
  /** When set, class-scoped signals for a different class are dropped. */
  selectedClassId?: string
  label?: string
  basis?: RecommendationSignalBasis
  choiceSetId?: string
}

function scopeForContribution(
  options: AddRecommendationContributionOptions,
): RecommendationScope | undefined {
  if (options.scope) return options.scope
  if (options.source?.kind === 'class') return classRecommendationScope(options.source.id)
  if (
    options.source?.kind === 'role' ||
    options.source?.kind === 'user' ||
    options.source?.kind === 'title'
  ) {
    return GLOBAL_RECOMMENDATION_SCOPE
  }
  return undefined
}

function mergeRecommendationContribution(
  existing: RecommendationAccumulator,
  args: {
    rank: number
    specificityRank: number
    reason: EquipmentRecommendationReason
    nextEvidence: SourcedEquipmentRecommendationEvidence
    label?: string
  },
): void {
  existing.reasons.add(args.reason)
  const key = equipmentEvidenceIdentity(args.nextEvidence)
  if (!existing.evidence.some((entry) => equipmentEvidenceIdentity(entry) === key)) {
    existing.evidence.push(args.nextEvidence)
  }

  if (args.rank < existing.minRank) {
    existing.minRank = args.rank
    existing.label = args.label ?? existing.label
  } else if (args.rank === existing.minRank && existing.label === undefined) {
    existing.label = args.label
  }

  if (args.specificityRank < existing.minSpecificityRank) {
    existing.minSpecificityRank = args.specificityRank
  }
}

export function addRecommendationContribution(
  accumulators: AccumulatorMap,
  equipmentId: string,
  tier: EquipmentRecommendationTier,
  reason: EquipmentRecommendationReason,
  specificity: EquipmentRecommendationSpecificity,
  options: AddRecommendationContributionOptions = {},
): void {
  const scope = scopeForContribution(options)
  if (!recommendationScopeApplies(scope, options.selectedClassId)) return

  const rank = EQUIPMENT_RECOMMENDATION_TIER_RANK[tier]
  const specificityRank = EQUIPMENT_RECOMMENDATION_SPECIFICITY_RANK[specificity]
  const existing = accumulators.get(equipmentId)
  const nextEvidence: SourcedEquipmentRecommendationEvidence = {
    reason,
    tier,
    specificity,
    ...(options.source ? { source: options.source } : {}),
    ...(scope ? { scope } : {}),
    ...(options.basis ? { basis: options.basis } : {}),
    ...(options.choiceSetId ? { choiceSetId: options.choiceSetId } : {}),
  }

  if (!existing) {
    accumulators.set(equipmentId, {
      minRank: rank,
      minSpecificityRank: specificityRank,
      reasons: new Set([reason]),
      evidence: [nextEvidence],
      label: options.label,
    })
    return
  }

  mergeRecommendationContribution(existing, {
    rank,
    specificityRank,
    reason,
    nextEvidence,
    label: options.label,
  })
}

export type DerivedEquipmentRecommendation = EquipmentRecommendation & {
  evidence: readonly SourcedEquipmentRecommendationEvidence[]
  resolved?: ResolvedEquipmentOption
}

export function toEquipmentRecommendation(
  accumulator: RecommendationAccumulator,
): DerivedEquipmentRecommendation {
  const tier = EQUIPMENT_RECOMMENDATION_TIERS.find(
    (candidate) => EQUIPMENT_RECOMMENDATION_TIER_RANK[candidate] === accumulator.minRank,
  )!
  return {
    tier,
    reasons: [...accumulator.reasons],
    specificity: getBestEquipmentRecommendationSpecificity(accumulator.evidence),
    ...(accumulator.label !== undefined ? { label: accumulator.label } : {}),
    evidence: accumulator.evidence,
  }
}
