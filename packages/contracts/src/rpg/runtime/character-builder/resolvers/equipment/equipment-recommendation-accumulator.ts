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
import type { RecommendationSignalBasis, RecommendationSourceRef } from '../../recommendation'
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
  label?: string
  basis?: RecommendationSignalBasis
  choiceSetId?: string
}

export function addRecommendationContribution(
  accumulators: AccumulatorMap,
  equipmentId: string,
  tier: EquipmentRecommendationTier,
  reason: EquipmentRecommendationReason,
  specificity: EquipmentRecommendationSpecificity,
  options: AddRecommendationContributionOptions = {},
): void {
  const rank = EQUIPMENT_RECOMMENDATION_TIER_RANK[tier]
  const specificityRank = EQUIPMENT_RECOMMENDATION_SPECIFICITY_RANK[specificity]
  const existing = accumulators.get(equipmentId)
  const nextEvidence: SourcedEquipmentRecommendationEvidence = {
    reason,
    tier,
    specificity,
    ...(options.source ? { source: options.source } : {}),
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

  existing.reasons.add(reason)
  const key = equipmentEvidenceIdentity(nextEvidence)
  if (!existing.evidence.some((entry) => equipmentEvidenceIdentity(entry) === key)) {
    existing.evidence.push(nextEvidence)
  }

  if (rank < existing.minRank) {
    existing.minRank = rank
    existing.label = options.label ?? existing.label
  } else if (rank === existing.minRank && existing.label === undefined) {
    existing.label = options.label
  }

  if (specificityRank < existing.minSpecificityRank) {
    existing.minSpecificityRank = specificityRank
  }
}

function evidenceForSpecificityCollapse(
  evidence: readonly SourcedEquipmentRecommendationEvidence[],
): readonly SourcedEquipmentRecommendationEvidence[] {
  const selective = evidence.filter(
    (row) => row.reason !== 'proficient' && row.reason !== 'notProficient',
  )
  return selective.length > 0 ? selective : evidence
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
    specificity: getBestEquipmentRecommendationSpecificity(
      evidenceForSpecificityCollapse(accumulator.evidence),
    ),
    ...(accumulator.label !== undefined ? { label: accumulator.label } : {}),
    evidence: accumulator.evidence,
  }
}
