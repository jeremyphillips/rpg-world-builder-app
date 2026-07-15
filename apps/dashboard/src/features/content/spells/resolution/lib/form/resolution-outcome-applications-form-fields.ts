import { supportsPartialApplicationForEffectKind } from '@rpg/contracts'
import type { SpellResolutionOutcomeResult } from '@rpg/contracts'
import { createElement } from 'react'
import type { FieldConfig, FieldOption, FormItem } from '@rpg/ui/form'

import { SpellResolutionOutcomeApplicationEffectIdField } from '../../components/outcomes/spell-resolution-outcome-application-effect-id.client'
import { SpellResolutionOutcomeApplicationStatus } from '../../components/outcomes/spell-resolution-outcome-application-status.client'

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

/** Leaf fields for resolver field-order and custom outcome rows (step 6). */
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

function outcomeApplicationAmountOptions({
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

  const row = arrayItems[rowIndex] as ResolutionOutcomeApplicationFormItem
  const effects = (watchedValues[RESOLUTION_EFFECTS_FIELD] as ResolutionEffectFormItem[]) ?? []
  const effect = findResolutionEffectById(effects, row.effectId)
  return amountOptionsForEffect(effect)
}

/** Visual array item fields until custom outcome rows replace schema rendering. */
export function outcomeApplicationsArrayItemFields(): FormItem[] {
  return [
    {
      kind: 'slot',
      name: 'effectId',
      render: () => createElement(SpellResolutionOutcomeApplicationEffectIdField),
    },
    {
      kind: 'slot',
      name: 'amount',
      render: () => createElement(SpellResolutionOutcomeApplicationStatus),
    },
  ]
}

/** Embedded array config for one outcome branch's effect applications. */
export function outcomeApplicationsArrayFields(): FormItem[] {
  return [
    {
      kind: 'array',
      name: 'applications',
      legend: '',
      size: 'sm',
      hideAddAction: true,
      reorder: false,
      itemChrome: 'subtle',
      itemVariant: 'detailed',
      itemHeader: {
        srOnly: true,
        fallback: (index) => `Application ${index + 1}`,
        summaryDependsOn: [RESOLUTION_EFFECTS_FIELD],
        summary: (values, _index, watched) =>
          formatOutcomeApplicationRowLabel(
            (watched?.[RESOLUTION_EFFECTS_FIELD] as ResolutionEffectFormItem[] | undefined) ?? [],
            values as ResolutionOutcomeApplicationFormItem,
          ),
      },
      filterSelectDependsOn: [RESOLUTION_EFFECTS_FIELD],
      filterSelectOptions: outcomeApplicationAmountOptions,
      fields: outcomeApplicationsArrayItemFields(),
    },
  ]
}
