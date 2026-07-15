import { getArrayFieldMutators } from '@rpg/ui/form'
import type { Control } from 'react-hook-form'

import {
  createOutcomeApplicationAppendValue,
  outcomeApplicationsFieldPath,
} from './resolution-outcome-applications-form-fields'
import type {
  ResolutionEffectFormItem,
  ResolutionFormValues,
  ResolutionOutcomeApplicationFormItem,
} from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'
import type { SpellResolutionOutcomeResult } from '@rpg/contracts'

export function readOutcomeApplications(
  applications: ResolutionOutcomeApplicationFormItem[] | undefined,
): ResolutionOutcomeApplicationFormItem[] {
  return applications ?? []
}

export function appendOutcomeApplication(
  getValues: (name: typeof RESOLUTION_FIELD_NAME) => ResolutionFormValues | undefined,
  setValue: (
    name: `${typeof RESOLUTION_FIELD_NAME}.outcomes`,
    value: NonNullable<ResolutionFormValues['outcomes']>,
    options: { shouldDirty: boolean; shouldValidate: boolean },
  ) => void,
  outcomeIndex: number,
  effectId: string,
  outcomeResult: SpellResolutionOutcomeResult,
  effects: readonly ResolutionEffectFormItem[],
): void {
  const outcomes = getValues(RESOLUTION_FIELD_NAME)?.outcomes
  if (!outcomes?.[outcomeIndex]) return

  const nextOutcomes = outcomes.map((entry, index) =>
    index === outcomeIndex
      ? {
          ...entry,
          applications: [
            ...readOutcomeApplications(entry.applications),
            createOutcomeApplicationAppendValue(effectId, outcomeResult, effects),
          ],
        }
      : entry,
  )

  setValue(`${RESOLUTION_FIELD_NAME}.outcomes`, nextOutcomes, {
    shouldDirty: true,
    shouldValidate: false,
  })
}

export function appendOutcomeApplicationSelection(
  control: Control,
  getValues: (name: typeof RESOLUTION_FIELD_NAME) => ResolutionFormValues | undefined,
  setValue: (
    name: `${typeof RESOLUTION_FIELD_NAME}.outcomes`,
    value: NonNullable<ResolutionFormValues['outcomes']>,
    options: { shouldDirty: boolean; shouldValidate: boolean },
  ) => void,
  outcomeIndex: number,
  effectId: string,
  outcomeResult: SpellResolutionOutcomeResult,
  effects: readonly ResolutionEffectFormItem[],
): void {
  const applicationsPath = outcomeApplicationsFieldPath(outcomeIndex)
  const appendValue = createOutcomeApplicationAppendValue(effectId, outcomeResult, effects)
  const mutators = getArrayFieldMutators(control, applicationsPath)

  if (mutators) {
    mutators.append(appendValue)
    return
  }

  appendOutcomeApplication(getValues, setValue, outcomeIndex, effectId, outcomeResult, effects)
}
