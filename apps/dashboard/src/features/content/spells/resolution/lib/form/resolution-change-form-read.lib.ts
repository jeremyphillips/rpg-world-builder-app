import type { Control } from 'react-hook-form'

import { getArrayFieldMutators } from '@rpg/ui/form'

import type { ResolutionFormValues } from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

type GetValues = (name?: string) => unknown

function getEffectsFromFieldArray(
  control: Control | undefined,
): ResolutionFormValues['effects'] | undefined {
  if (!control) return undefined

  const mutators = getArrayFieldMutators(control, `${RESOLUTION_FIELD_NAME}.effects`)
  const effects = mutators?.getValues() as ResolutionFormValues['effects'] | undefined
  return effects?.length ? effects : undefined
}

function readResolutionEffects(
  getValues: GetValues,
  control: Control | undefined,
  resolution: ResolutionFormValues,
  initialResolution?: ResolutionFormValues,
): ResolutionFormValues['effects'] {
  const effects =
    getEffectsFromFieldArray(control) ??
    (getValues(`${RESOLUTION_FIELD_NAME}.effects`) as
      | ResolutionFormValues['effects']
      | undefined) ??
    resolution.effects ??
    initialResolution?.effects ??
    []

  return effects.length > 0 ? effects : (initialResolution?.effects ?? effects)
}

function readResolutionOutcomes(
  getValues: GetValues,
  root: { resolution?: ResolutionFormValues },
  resolution: ResolutionFormValues,
  initialResolution?: ResolutionFormValues,
): ResolutionFormValues['outcomes'] {
  return (
    (getValues(`${RESOLUTION_FIELD_NAME}.outcomes`) as
      | ResolutionFormValues['outcomes']
      | undefined) ??
    root.resolution?.outcomes ??
    resolution.outcomes ??
    initialResolution?.outcomes
  )
}

/** Merges live RHF values with defaults for resolution confirm/remove flows. */
export function readResolutionValues(
  getValues: GetValues,
  control?: Control,
  initialResolution?: ResolutionFormValues,
): ResolutionFormValues | undefined {
  const root = getValues() as { resolution?: ResolutionFormValues }
  const resolution =
    (getValues(RESOLUTION_FIELD_NAME) as ResolutionFormValues | undefined) ??
    root.resolution ??
    initialResolution
  if (!resolution) return undefined

  return {
    ...resolution,
    effects: readResolutionEffects(getValues, control, resolution, initialResolution),
    outcomes: readResolutionOutcomes(getValues, root, resolution, initialResolution),
  }
}
