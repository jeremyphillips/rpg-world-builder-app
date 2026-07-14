import { createOutcomeApplicationAppendValue } from './resolution-outcome-form-fields'
import type {
  ResolutionFormValues,
  ResolutionOutcomeApplicationFormItem,
} from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

export function appendOutcomeApplication(
  getValues: (name: typeof RESOLUTION_FIELD_NAME) => ResolutionFormValues | undefined,
  setValue: (
    name: `${typeof RESOLUTION_FIELD_NAME}.outcomes`,
    value: NonNullable<ResolutionFormValues['outcomes']>,
    options: { shouldDirty: boolean; shouldValidate: boolean },
  ) => void,
  outcomeIndex: number,
  effectId: string,
): void {
  const outcomes = getValues(RESOLUTION_FIELD_NAME)?.outcomes
  if (!outcomes?.[outcomeIndex]) return

  const nextOutcomes = outcomes.map((entry, index) =>
    index === outcomeIndex
      ? {
          ...entry,
          applications: [...entry.applications, createOutcomeApplicationAppendValue(effectId)],
        }
      : entry,
  )

  setValue(`${RESOLUTION_FIELD_NAME}.outcomes`, nextOutcomes, {
    shouldDirty: true,
    shouldValidate: false,
  })
}

export function removeOutcomeApplication(
  getValues: (name: typeof RESOLUTION_FIELD_NAME) => ResolutionFormValues | undefined,
  setValue: (
    name: `${typeof RESOLUTION_FIELD_NAME}.outcomes`,
    value: NonNullable<ResolutionFormValues['outcomes']>,
    options: { shouldDirty: boolean; shouldValidate: boolean },
  ) => void,
  outcomeIndex: number,
  applicationIndex: number,
): void {
  const outcomes = getValues(RESOLUTION_FIELD_NAME)?.outcomes
  if (!outcomes?.[outcomeIndex]) return

  const nextOutcomes = outcomes.map((entry, index) =>
    index === outcomeIndex
      ? {
          ...entry,
          applications: entry.applications.filter((_, itemIndex) => itemIndex !== applicationIndex),
        }
      : entry,
  )

  setValue(`${RESOLUTION_FIELD_NAME}.outcomes`, nextOutcomes, {
    shouldDirty: true,
    shouldValidate: false,
  })
}

export function readOutcomeApplications(
  applications: ResolutionOutcomeApplicationFormItem[] | undefined,
): ResolutionOutcomeApplicationFormItem[] {
  return applications ?? []
}
