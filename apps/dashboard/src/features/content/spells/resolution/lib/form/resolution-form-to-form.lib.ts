import type { SpellResolution } from '@rpg/contracts'
import { inferSpellResolutionTargetCountKind } from '@rpg/contracts'

import { applicationPatternToForm } from '../application-pattern/resolution-application-pattern.lib'
import { EMPTY_RESOLUTION_AREA_OF_EFFECT, resolutionAreaToForm } from './resolution-area-values'
import { effectToForm } from './resolution-effect-values'
import type { ResolutionFormValues } from './resolution-form-schema'
import { applyMethodFields, buildMethodKind } from './resolution-method-values'
import { storedOutcomesToForm } from './resolution-outcome-values'
import { applyProximityFields } from './resolution-target-values'

/** Maps stored resolution target/origin/area fields to form defaults. */
export function buildResolutionFormSelectionFields(
  resolution: SpellResolution,
): Pick<
  ResolutionFormValues,
  | 'selectionMode'
  | 'targetCount'
  | 'countKind'
  | 'targetKind'
  | 'proximityKind'
  | 'originDistanceFt'
  | 'areaOfEffect'
> {
  const target = resolution.target
  return {
    selectionMode: resolution.selectionMode,
    targetCount: target?.count ?? 1,
    countKind: target?.countKind ?? inferSpellResolutionTargetCountKind(target?.count ?? 1),
    targetKind: target?.kind ?? 'creature',
    proximityKind: target?.proximity.kind ?? 'touch',
    originDistanceFt: resolution.origin?.proximity.distance.value,
    areaOfEffect: resolution.areaOfEffect
      ? resolutionAreaToForm(resolution.areaOfEffect)
      : { ...EMPTY_RESOLUTION_AREA_OF_EFFECT },
  }
}

/** Maps stored resolution method/effects/outcomes to form fields. */
export function buildResolutionFormMechanicsFields(
  resolution: SpellResolution,
): Pick<ResolutionFormValues, 'methodKind' | 'effects' | 'outcomes'> &
  ReturnType<typeof applicationPatternToForm> {
  return {
    methodKind: buildMethodKind(resolution.method),
    effects: resolution.effects.map(effectToForm),
    outcomes: storedOutcomesToForm(resolution.method, resolution.outcomes),
    ...applicationPatternToForm(resolution.applicationPattern),
  }
}

/** Applies method and proximity sub-fields after base form object is built. */
export function applyResolutionFormDerivedFields(
  form: ResolutionFormValues,
  resolution: SpellResolution,
): ResolutionFormValues {
  applyMethodFields(form, resolution.method)
  if (resolution.target) {
    applyProximityFields(form, resolution.target.proximity)
  }
  return form
}
