import type { ResolutionSelectionState } from '@rpg/contracts'

import { SPELL_AREA_GEOMETRY_NONE } from '../../../lib/spell-form-labels'
import { flatTargetSelectionFields } from '../form/resolution-form-target.lib'
import type { ResolutionFormValues } from '../form/resolution-form-schema'

/** Maps flattened resolution form values to contract selection context. */
export function resolutionFormToSelectionContext(
  values: ResolutionFormValues | undefined,
): ResolutionSelectionState | undefined {
  if (!values) return undefined

  const areaShape = values.areaOfEffect?.shape
  const hasAreaOfEffect = Boolean(areaShape && areaShape !== SPELL_AREA_GEOMETRY_NONE)

  const targetFields = flatTargetSelectionFields(values.target)

  return {
    selectionMode: values.selectionMode,
    countKind: targetFields.countKind,
    originDistanceFt: values.originDistanceFt,
    hasAreaOfEffect,
    areaOfEffectShape: hasAreaOfEffect ? areaShape : undefined,
    proximityKind: targetFields.proximityKind,
    proximityDistanceFt: targetFields.proximityDistanceFt,
    proximityReachDistanceFt: targetFields.proximityReachDistanceFt,
    targetKind: targetFields.targetKind,
    targetCount: targetFields.targetCount,
    methodKind: values.methodKind,
    attackType: values.attackType,
    saveAbility: values.saveAbility,
    applicationPatternKind: values.applicationPatternKind,
    projectileCount: values.projectileCount,
    projectileUnitLabelSingular: values.projectileUnitLabelSingular,
    projectileUnitLabelPlural: values.projectileUnitLabelPlural,
    effects: values.effects,
    outcomes: values.outcomes,
  }
}

export function resolutionSelectionContextFromWatched(
  watched: Record<string, unknown>,
  prefix = 'resolution.',
): ResolutionSelectionState {
  const read = (key: string) => watched[`${prefix}${key}`]
  const areaShape = read('areaOfEffect.shape') as string | undefined
  const hasAreaOfEffect = Boolean(areaShape && areaShape !== SPELL_AREA_GEOMETRY_NONE)
  const target = read('target') as ResolutionFormValues['target'] | undefined
  const targetFields = flatTargetSelectionFields(target)

  return {
    selectionMode: read('selectionMode') as ResolutionSelectionState['selectionMode'],
    countKind: targetFields.countKind,
    originDistanceFt: read('originDistanceFt') as number | undefined,
    hasAreaOfEffect,
    areaOfEffectShape: hasAreaOfEffect ? areaShape : undefined,
    proximityKind: targetFields.proximityKind,
    proximityDistanceFt: targetFields.proximityDistanceFt,
    proximityReachDistanceFt: targetFields.proximityReachDistanceFt,
    targetKind: targetFields.targetKind,
    targetCount: targetFields.targetCount,
    methodKind: read('methodKind') as ResolutionSelectionState['methodKind'],
    attackType: read('attackType') as ResolutionSelectionState['attackType'],
    saveAbility: read('saveAbility') as string | undefined,
    applicationPatternKind: read(
      'applicationPatternKind',
    ) as ResolutionSelectionState['applicationPatternKind'],
  }
}

/** Converts contract selection cleanup patches to resolution form field updates. */
export { selectionCleanupPatchToFormPatch } from './selection-cleanup-form-patch.lib'
