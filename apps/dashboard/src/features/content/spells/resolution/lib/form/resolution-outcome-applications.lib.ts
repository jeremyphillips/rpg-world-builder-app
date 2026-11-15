import { createOutcomeApplicationAppendValue } from './resolution-outcome-applications-form-fields'
import type {
  ResolutionEffectFormItem,
  ResolutionFormValues,
  ResolutionOutcomeEffectReferenceFormItem,
  ResolutionOutcomeFormItem,
} from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'
import type { ResolutionOutcomeResult } from '@rpg/contracts'

export function readOutcomeApplications(
  effects: ResolutionOutcomeFormItem['effects'] | undefined,
): ResolutionOutcomeEffectReferenceFormItem[] {
  return (effects ?? []).filter(
    (effect): effect is ResolutionOutcomeEffectReferenceFormItem =>
      effect.kind === 'effect-reference',
  )
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
  outcomeResult: ResolutionOutcomeResult,
  effects: readonly ResolutionEffectFormItem[],
): void {
  const outcomes = getValues(RESOLUTION_FIELD_NAME)?.outcomes
  if (!outcomes?.[outcomeIndex]) return

  const nextOutcomes = outcomes.map((entry, index) =>
    index === outcomeIndex
      ? {
          ...entry,
          effects: [
            ...(entry.effects ?? []),
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
