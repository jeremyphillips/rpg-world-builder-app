import type { ResolutionSelectionState } from '@rpg/contracts'

import { SPELL_AREA_GEOMETRY_NONE } from '../../../lib/spell-form-labels'
import { applyFlatTargetPatch } from '../form/resolution-form-target.lib'
import type { ResolutionFormValues } from '../form/resolution-form-schema'

const SHARED_FORM_PATCH_KEYS = [
  'selectionMode',
  'originDistanceFt',
] as const satisfies readonly (keyof ResolutionFormValues & keyof ResolutionSelectionState)[]

const FLAT_TARGET_PATCH_KEYS = [
  'countKind',
  'proximityKind',
  'proximityDistanceFt',
  'proximityReachDistanceFt',
  'targetKind',
  'targetCount',
] as const satisfies readonly (keyof ResolutionSelectionState)[]

/** Converts contract selection cleanup patches to resolution form field updates. */
export function selectionCleanupPatchToFormPatch(
  patch: Partial<ResolutionSelectionState>,
  current?: Pick<ResolutionFormValues, 'target'>,
): Partial<ResolutionFormValues> {
  const { hasAreaOfEffect, areaOfEffectShape: _shape, ...rest } = patch

  const formPatch = Object.fromEntries(
    SHARED_FORM_PATCH_KEYS.filter((key) => key in rest).map((key) => [key, rest[key]]),
  ) as Partial<ResolutionFormValues>

  const targetPatch = Object.fromEntries(
    FLAT_TARGET_PATCH_KEYS.filter((key) => key in rest).map((key) => [key, rest[key]]),
  ) as Parameters<typeof applyFlatTargetPatch>[1]

  const clearsTarget = FLAT_TARGET_PATCH_KEYS.some((key) => key in rest && rest[key] === undefined)
  if (clearsTarget) {
    formPatch.target = undefined
  } else if (Object.keys(targetPatch).length > 0) {
    formPatch.target = applyFlatTargetPatch(current?.target, targetPatch)
  }

  if (hasAreaOfEffect === false) {
    formPatch.areaOfEffect = { shape: SPELL_AREA_GEOMETRY_NONE }
    formPatch.occupantRequirements = undefined
  }

  return formPatch
}
