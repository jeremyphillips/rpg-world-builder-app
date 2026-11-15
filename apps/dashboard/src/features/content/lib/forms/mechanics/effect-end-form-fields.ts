import {
  EFFECT_END_TIMING_OPTION_IDS,
  effectEndTimingSelectOptions,
  getTermSentenceForm,
  TIME_UNIT_ENTRIES,
} from '@rpg/contracts'
import type { FieldVisibility, FormItem } from '@rpg/ui/form'

import {
  distanceAmountOptions,
  distanceJoinedPairField,
} from '../fields/content-distance-form-fields'

export const EFFECT_END_TIMING_SELECT_LABEL = 'Effect ends'
export const EFFECT_END_TIMING_EMPTY_LABEL = 'No specified end'
export const EFFECT_END_CUSTOM_TIMING_LABEL = 'Custom timing'
export const EFFECT_END_CUSTOM_TIMING_PLACEHOLDER = 'Until the curse ends'
export const EFFECT_END_DURATION_LABEL = 'Duration'

const HOLD_BREATH_MINUTES = [1, 5, 10, 15, 30] as const
const HOLD_BREATH_HOURS = [1, 2, 4, 8, 12, 24] as const

const EFFECT_END_DURATION_UNITS = (['hour', 'minute'] as const).map((unit) => ({
  value: unit,
  label: getTermSentenceForm(TIME_UNIT_ENTRIES[unit], 1),
}))

function visibleWhenEffectEndOption(
  optionId: (typeof EFFECT_END_TIMING_OPTION_IDS)[keyof typeof EFFECT_END_TIMING_OPTION_IDS],
): FieldVisibility {
  return {
    dependsOn: ['effectEndOption'],
    visibleWhen: (values) => values.effectEndOption === optionId,
  }
}

export function effectEndDurationJoinedPairField(): FormItem {
  return distanceJoinedPairField({
    amountName: 'end.value',
    label: EFFECT_END_DURATION_LABEL,
    presets: HOLD_BREATH_HOURS,
    unitName: 'end.unit',
    unitOptions: EFFECT_END_DURATION_UNITS,
    presetsByUnit: {
      hour: distanceAmountOptions(HOLD_BREATH_HOURS),
      minute: distanceAmountOptions(HOLD_BREATH_MINUTES),
    },
    allowCustom: true,
    customMin: 1,
    customMax: 1440,
    clearAmountWhenUnitChanges: true,
    digits: 2,
    visibility: visibleWhenEffectEndOption(EFFECT_END_TIMING_OPTION_IDS.timed),
    required: true,
  })
}

export type EffectEndFormFieldsOptions = {
  visibility?: FieldVisibility
}

/** Shared Ends control for structured effect lifetimes. First consumer: on-hit conditions. */
export function effectEndFormFields(options?: EffectEndFormFieldsOptions): FormItem[] {
  const rootVisibility = options?.visibility
  const timed = visibleWhenEffectEndOption(EFFECT_END_TIMING_OPTION_IDS.timed)
  const custom = visibleWhenEffectEndOption(EFFECT_END_TIMING_OPTION_IDS.custom)
  return [
    {
      type: 'select',
      name: 'effectEndOption',
      label: EFFECT_END_TIMING_SELECT_LABEL,
      placeholder: EFFECT_END_TIMING_EMPTY_LABEL,
      ...(rootVisibility ? { visibility: rootVisibility } : {}),
      options: effectEndTimingSelectOptions(),
    },
    effectEndDurationJoinedPairField(),
    {
      type: 'text',
      name: 'end.text',
      label: EFFECT_END_CUSTOM_TIMING_LABEL,
      placeholder: EFFECT_END_CUSTOM_TIMING_PLACEHOLDER,
      visibility: custom,
      required: true,
    },
  ]
}
