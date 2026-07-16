import { supportsPartialApplicationForEffectKind } from '@rpg/contracts'
import type { SpellResolutionOutcomeResult } from '@rpg/contracts'
import type { FieldConfig, FieldOption, FormItem } from '@rpg/ui/form'

import { defaultApplicationAmountForOutcome } from './resolution-effect-validity.lib'
import {
  findResolutionEffectById,
  formatEffectReferenceTitle,
  resolveEffectReferenceById,
} from './resolution-effect-reference.lib'
import { RESOLUTION_OUTCOME_AMOUNT_OPTIONS } from './resolution-form-labels'
import type {
  ResolutionEffectFormItem,
  ResolutionOutcomeApplicationFormItem,
} from './resolution-form-schema'
import { RESOLUTION_FIELD_NAME } from './resolution-form-values'

const RESOLUTION_EFFECTS_FIELD = `${RESOLUTION_FIELD_NAME}.effects` as const

/** Leaf fields for resolver field-order and custom outcome rows. */
export const outcomeApplicationEffectIdField = {
  type: 'text',
  name: 'effectId',
  label: '',
  width: 'full',
} satisfies FieldConfig

export const outcomeApplicationAmountField = {
  type: 'select',
  name: 'amount',
  label: '',
  options: RESOLUTION_OUTCOME_AMOUNT_OPTIONS,
  width: 'lg',
  presentation: {
    readOnlyWhen: ({ options }) => options.length === 1,
  },
} satisfies FieldConfig

export function outcomeApplicationsResolverItemFields(): FormItem[] {
  return [outcomeApplicationEffectIdField, outcomeApplicationAmountField]
}

export function formatOutcomeApplicationRowLabel(
  effects: readonly ResolutionEffectFormItem[],
  application: ResolutionOutcomeApplicationFormItem,
): string {
  return formatEffectReferenceTitle(resolveEffectReferenceById(effects, application.effectId))
}

export function createOutcomeApplicationAppendValue(
  effectId: string,
  outcomeResult: SpellResolutionOutcomeResult,
  effects: readonly ResolutionEffectFormItem[],
): ResolutionOutcomeApplicationFormItem {
  const effect = findResolutionEffectById(effects, effectId)
  const amount = effect ? defaultApplicationAmountForOutcome(effect, outcomeResult) : 'full'

  return { effectId, amount }
}

export function amountOptionsForEffect(
  effect: ResolutionEffectFormItem | undefined,
): FieldOption[] {
  if (!effect || !supportsPartialApplicationForEffectKind(effect.kind)) {
    return RESOLUTION_OUTCOME_AMOUNT_OPTIONS.filter((option) => option.value === 'full').map(
      (option) => ({ ...option }),
    )
  }

  return RESOLUTION_OUTCOME_AMOUNT_OPTIONS.map((option) => ({ ...option }))
}

export function outcomeApplicationsFieldPath(
  outcomeIndex: number,
): `${typeof RESOLUTION_FIELD_NAME}.outcomes.${number}.applications` {
  return `${RESOLUTION_FIELD_NAME}.outcomes.${outcomeIndex}.applications`
}

export function outcomeApplicationAmountOptions({
  arrayItems,
  rowIndex,
  fieldName,
  options,
  watchedValues,
}: {
  arrayItems: unknown[]
  rowIndex: number
  fieldName: string
  options: FieldOption[]
  watchedValues: Record<string, unknown>
}): FieldOption[] {
  if (fieldName !== 'amount') return [...options]

  const row = arrayItems[rowIndex] as ResolutionOutcomeApplicationFormItem | undefined
  if (!row?.effectId) return [...options]

  const effects = (watchedValues[RESOLUTION_EFFECTS_FIELD] as ResolutionEffectFormItem[]) ?? []
  const effect = findResolutionEffectById(effects, row.effectId)
  return amountOptionsForEffect(effect)
}
