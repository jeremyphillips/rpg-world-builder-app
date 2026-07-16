import type { ResolutionSelectionState } from '@rpg/contracts'

import { SPELL_AREA_GEOMETRY_NONE } from '../../../lib/spell-form-labels'
import type { ResolutionFormValues } from '../form/resolution-form-schema'

/** Maps flattened resolution form values to contract selection context. */
export function resolutionFormToSelectionContext(
  values: ResolutionFormValues | undefined,
): ResolutionSelectionState | undefined {
  if (!values) return undefined

  const areaShape = values.areaOfEffect?.shape
  const hasAreaOfEffect = Boolean(areaShape && areaShape !== SPELL_AREA_GEOMETRY_NONE)

  return {
    selectionMode: values.selectionMode,
    countKind: values.countKind,
    originDistanceFt: values.originDistanceFt,
    hasAreaOfEffect,
    areaOfEffectShape: hasAreaOfEffect ? areaShape : undefined,
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

  return {
    selectionMode: read('selectionMode') as ResolutionSelectionState['selectionMode'],
    countKind: read('countKind') as ResolutionSelectionState['countKind'],
    originDistanceFt: read('originDistanceFt') as number | undefined,
    hasAreaOfEffect,
    areaOfEffectShape: hasAreaOfEffect ? areaShape : undefined,
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

/** Converts contract selection cleanup patches to resolution form field updates. */
export { selectionCleanupPatchToFormPatch } from './selection-cleanup-form-patch.lib'
