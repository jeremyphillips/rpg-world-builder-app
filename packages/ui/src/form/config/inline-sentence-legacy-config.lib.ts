import type {
  ChooseFromChipsFieldConfig,
  InlineChooseCountFieldConfig,
  InlineSentenceBelowChips,
  InlineSentenceFieldConfig,
  InlineSentenceSegment,
  InputUnitFieldConfig,
} from '../field-config'

/** Maps legacy `inlineChooseCount` configs to `inlineSentence`. */
export function inlineChooseCountToInlineSentence(
  config: InlineChooseCountFieldConfig,
): InlineSentenceFieldConfig {
  const segments: InlineSentenceSegment[] = []

  if (config.prefix) {
    segments.push({ kind: 'text', value: config.prefix, tone: 'label' })
  }

  segments.push({
    kind: 'number',
    name: config.name,
    min: config.chooseMin,
    max: config.chooseMax,
    digits: config.digits,
    defaultValue: config.defaultValue,
  })

  if (config.suffix) {
    segments.push({ kind: 'text', value: config.suffix, tone: 'label' })
  }

  if (config.selectName && config.selectOptions?.length) {
    segments.push({
      kind: 'select',
      name: config.selectName,
      options: config.selectOptions,
      defaultValue: config.selectDefaultValue,
      ariaLabel: config.selectLabel ?? config.label,
    })
  }

  return {
    type: 'inlineSentence',
    name: config.name,
    label: config.label,
    segments,
    hideLabel: config.hideLabel,
    hint: config.hint,
    info: config.info,
    required: config.required,
    disabled: config.disabled,
    size: config.size,
    width: config.width,
    visibility: config.visibility,
  }
}

/** Maps legacy `chooseFromChips` configs to `inlineSentence`. */
export function chooseFromChipsToInlineSentence(
  config: ChooseFromChipsFieldConfig,
): InlineSentenceFieldConfig {
  const below: InlineSentenceBelowChips = {
    kind: 'chips',
    name: config.name,
    options: config.options,
    chipSize: config.chipSize,
    defaultValue: config.defaultValue,
  }

  return {
    type: 'inlineSentence',
    name: config.name,
    label: config.label,
    segments: [
      { kind: 'text', value: config.prefix ?? 'Choose', tone: 'label' },
      {
        kind: 'number',
        name: config.chooseName,
        min: config.chooseMin,
        max: config.chooseMax,
        defaultValue: config.chooseDefaultValue,
      },
      { kind: 'text', value: config.suffix ?? 'skills from:', tone: 'label' },
    ],
    below,
    hint: config.hint,
    info: config.info,
    required: config.required,
    disabled: config.disabled,
    size: config.size,
    width: config.width,
    chipSize: config.chipSize,
    visibility: config.visibility,
  }
}

/** Maps legacy `inputUnit` configs to `inlineSentence`. */
export function inputUnitToInlineSentence(config: InputUnitFieldConfig): InlineSentenceFieldConfig {
  return {
    type: 'inlineSentence',
    name: config.name,
    label: config.label,
    segments: [
      {
        kind: 'number',
        name: config.name,
        min: config.min,
        max: config.max,
        digits: config.valueDigits,
        defaultValue: config.defaultValue,
        ariaLabel: `${config.label} value`,
      },
      { kind: 'text', value: config.unit, tone: 'label' },
    ],
    hint: config.hint,
    info: config.info,
    required: config.required,
    disabled: config.disabled,
    size: config.size,
    width: config.width,
    visibility: config.visibility,
  }
}
