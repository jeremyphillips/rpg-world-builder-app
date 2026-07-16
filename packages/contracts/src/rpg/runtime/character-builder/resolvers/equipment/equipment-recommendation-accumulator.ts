import {
  EQUIPMENT_RECOMMENDATION_SPECIFICITY_RANK,
  EQUIPMENT_RECOMMENDATION_TIER_RANK,
  EQUIPMENT_RECOMMENDATION_TIERS,
  getBestEquipmentRecommendationSpecificity,
  type EquipmentRecommendation,
  type EquipmentRecommendationEvidence,
  type EquipmentRecommendationReason,
  type EquipmentRecommendationSpecificity,
  type EquipmentRecommendationTier,
} from '../../../../content/equipment-recommendation'

export type RecommendationAccumulator = {
  minRank: number
  minSpecificityRank: number
  reasons: Set<EquipmentRecommendationReason>
  evidence: EquipmentRecommendationEvidence[]
  label?: string
}

export type AccumulatorMap = Map<string, RecommendationAccumulator>

function evidenceKey(evidence: EquipmentRecommendationEvidence): string {
  return `${evidence.reason}:${evidence.sourceKey}`
}

export function addRecommendationContribution(
  accumulators: AccumulatorMap,
  equipmentId: string,
  tier: EquipmentRecommendationTier,
  reason: EquipmentRecommendationReason,
  sourceKey: string,
  specificity: EquipmentRecommendationSpecificity,
  label?: string,
): void {
  const rank = EQUIPMENT_RECOMMENDATION_TIER_RANK[tier]
  const specificityRank = EQUIPMENT_RECOMMENDATION_SPECIFICITY_RANK[specificity]
  const existing = accumulators.get(equipmentId)
  const nextEvidence: EquipmentRecommendationEvidence = { reason, tier, sourceKey, specificity }

  if (!existing) {
    accumulators.set(equipmentId, {
      minRank: rank,
      minSpecificityRank: specificityRank,
      reasons: new Set([reason]),
      evidence: [nextEvidence],
      label,
    })
    return
  }

  existing.reasons.add(reason)
  const key = evidenceKey(nextEvidence)
  if (!existing.evidence.some((entry) => evidenceKey(entry) === key)) {
    existing.evidence.push(nextEvidence)
  }

  if (rank < existing.minRank) {
    existing.minRank = rank
    existing.label = label ?? existing.label
  } else if (rank === existing.minRank && existing.label === undefined) {
    existing.label = label
  }

  if (specificityRank < existing.minSpecificityRank) {
    existing.minSpecificityRank = specificityRank
  }
}

function evidenceForSpecificityCollapse(
  evidence: readonly EquipmentRecommendationEvidence[],
): readonly EquipmentRecommendationEvidence[] {
  const selective = evidence.filter(
    (row) => row.reason !== 'proficient' && row.reason !== 'notProficient',
  )
  return selective.length > 0 ? selective : evidence
}

export function toEquipmentRecommendation(
  accumulator: RecommendationAccumulator,
): EquipmentRecommendation {
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
  }
}
