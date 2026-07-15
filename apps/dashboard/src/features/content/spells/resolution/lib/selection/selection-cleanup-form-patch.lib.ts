import type { ResolutionSelectionState } from '@rpg/contracts'

import { SPELL_AREA_GEOMETRY_NONE } from '../../../lib/spell-form-labels'
import type { ResolutionFormValues } from '../form/resolution-form-schema'

const SHARED_FORM_PATCH_KEYS = [
  'selectionMode',
  'countKind',
  'originDistanceFt',
  'proximityKind',
  'proximityDistanceFt',
  'proximityReachDistanceFt',
  'targetKind',
  'targetCount',
] as const satisfies readonly (keyof ResolutionFormValues & keyof ResolutionSelectionState)[]

/** Converts contract selection cleanup patches to resolution form field updates. */
export function selectionCleanupPatchToFormPatch(
  patch: Partial<ResolutionSelectionState>,
): Partial<ResolutionFormValues> {
  const { hasAreaOfEffect, areaOfEffectShape: _shape, ...rest } = patch

  const formPatch = Object.fromEntries(
    SHARED_FORM_PATCH_KEYS.filter((key) => key in rest).map((key) => [key, rest[key]]),
  ) as Partial<ResolutionFormValues>

  if (hasAreaOfEffect === false) {
    formPatch.areaOfEffect = { shape: SPELL_AREA_GEOMETRY_NONE }
  }

  return formPatch
}
