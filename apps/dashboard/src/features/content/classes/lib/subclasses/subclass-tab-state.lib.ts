import type { FeatureRowForm } from '../class-feature-form-fields'

export type SubclassTabMode = 'create' | 'edit'

export type SubclassTabGateKind = 'create' | 'choice-level' | 'loading'

export function resolveSubclassTabGate({
  mode,
  campaignId,
  classId,
  subclassChoiceFeature,
  isPending,
}: {
  mode: SubclassTabMode | undefined
  campaignId?: string
  classId?: string
  subclassChoiceFeature: Pick<FeatureRowForm, 'level'> | undefined
  isPending: boolean
}): SubclassTabGateKind | null {
  if (mode === 'create' || !campaignId || !classId) {
    return 'create'
  }
  if (!subclassChoiceFeature) {
    return 'choice-level'
  }
  if (isPending) {
    return 'loading'
  }
  return null
}

export function resolveDefaultFeatureLevel(
  subclassChoiceFeature: Pick<FeatureRowForm, 'level'> | undefined,
): number | null {
  if (!subclassChoiceFeature) return null
  return Number(subclassChoiceFeature.level)
}
