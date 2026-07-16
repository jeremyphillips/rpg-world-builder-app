import type { ResolutionSelectionState } from '@rpg/contracts'

import type { ResolutionFormValues } from '../form/resolution-form-schema'

/** Maps flattened resolution form values to contract selection context. */
export function resolutionFormToSelectionContext(
  values: ResolutionFormValues | undefined,
): ResolutionSelectionState | undefined {
  if (!values) return undefined

  return {
    proximityKind: values.proximityKind,
    proximityDistanceFt: values.proximityDistanceFt,
    proximityReachDistanceFt: values.proximityReachDistanceFt,
    targetKind: values.targetKind,
    targetCount: values.targetCount,
    methodKind: values.methodKind,
    attackType: values.attackType,
    saveAbility: values.saveAbility,
    applicationPatternKind: values.applicationPatternKind,
    projectileCount: values.projectileCount,
    projectileUnitLabelSingular: values.projectileUnitLabelSingular,
    projectileUnitLabelPlural: values.projectileUnitLabelPlural,
    effects: values.effects,
  }
}

export function resolutionSelectionContextFromWatched(
  watched: Record<string, unknown>,
  prefix = 'resolution.',
): ResolutionSelectionState {
  const read = (key: string) => watched[`${prefix}${key}`]
  return {
    proximityKind: read('proximityKind') as ResolutionSelectionState['proximityKind'],
    proximityDistanceFt: read('proximityDistanceFt') as number | undefined,
    proximityReachDistanceFt: read('proximityReachDistanceFt') as number | undefined,
    targetKind: read('targetKind') as string | undefined,
    targetCount: read('targetCount') as number | undefined,
    methodKind: read('methodKind') as ResolutionSelectionState['methodKind'],
    attackType: read('attackType') as ResolutionSelectionState['attackType'],
    saveAbility: read('saveAbility') as string | undefined,
    applicationPatternKind: read(
      'applicationPatternKind',
    ) as ResolutionSelectionState['applicationPatternKind'],
  }
}
