import type { EquipmentRecommendationEvidence } from '../../../../content/equipment-recommendation'
import type { RecommendationSignalBasis, RecommendationSourceRef } from '../../recommendation'

export type SourcedEquipmentRecommendationEvidence = EquipmentRecommendationEvidence & {
  /** Absent when the contributing reason has no recommendation source. */
  source?: RecommendationSourceRef
  basis?: RecommendationSignalBasis
  choiceSetId?: string
}

export function classRecommendationSource(classId: string): RecommendationSourceRef {
  return { kind: 'class', id: classId }
}

const UNSOURCED_EQUIPMENT_REASONS = new Set<EquipmentRecommendationEvidence['reason']>([
  'classToolNeed',
  'selectedToolProficiency',
  'unresolvedToolProficiencyChoice',
])

export function sourceForEquipmentReason(
  reason: EquipmentRecommendationEvidence['reason'],
  classId: string,
): RecommendationSourceRef | undefined {
  if (UNSOURCED_EQUIPMENT_REASONS.has(reason)) return undefined
  return classRecommendationSource(classId)
}

export function equipmentEvidenceIdentity(
  evidence: SourcedEquipmentRecommendationEvidence,
): string {
  return [
    evidence.reason,
    evidence.source ? recommendationSourceIdentity(evidence.source) : '',
    evidence.choiceSetId ?? '',
    evidence.specificity,
  ].join(':')
}

export function recommendationSourceIdentity(source: RecommendationSourceRef): string {
  switch (source.kind) {
    case 'title':
      return `title:${source.organizationId}:${source.titleId}`
    case 'user':
      return 'user'
    default:
      return `${source.kind}:${source.id}`
  }
}
