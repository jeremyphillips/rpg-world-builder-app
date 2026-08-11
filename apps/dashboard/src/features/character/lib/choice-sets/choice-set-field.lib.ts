import type { ChoiceSet, ChoiceSetOption } from '@rpg/contracts'
import type { ComboboxFieldOption, RadioCardOption } from '@rpg/ui'
import type { FieldOption } from '@rpg/ui/form'

/** Option counts above this use the searchable combobox renderer (e.g. any-tool pools). */
export const CHOICE_SET_COMBOBOX_OPTION_THRESHOLD = 12

export type ChoiceSetFieldVariant = 'single-card' | 'multi-chips' | 'searchable-combobox'

export function resolveChoiceSetFieldVariant(choiceSet: ChoiceSet): ChoiceSetFieldVariant {
  if (choiceSet.options.length > CHOICE_SET_COMBOBOX_OPTION_THRESHOLD) {
    return 'searchable-combobox'
  }

  if (choiceSet.max === 1) {
    return 'single-card'
  }

  return 'multi-chips'
}

export function formatChoiceSetSelectionHint(choiceSet: ChoiceSet): string | undefined {
  if (choiceSet.min === choiceSet.max) {
    return choiceSet.min === 1 ? 'Choose 1 option' : `Choose ${choiceSet.min} options`
  }

  return `Choose ${choiceSet.min}–${choiceSet.max} options`
}

export function mapChoiceSetOptionsToFieldOptions(
  options: readonly ChoiceSetOption[],
): Array<{ value: string; label: string }> {
  return options.map((option) => ({
    value: option.id,
    label: option.label,
  }))
}

export function mapChoiceSetOptionsToRadioCardOptions(
  options: readonly ChoiceSetOption[],
): RadioCardOption[] {
  return options.map((option) => ({
    value: option.id,
    label: option.label,
    description: option.description,
  }))
}

export function mapFieldOptionsToRadioCardOptions(
  options: readonly FieldOption[],
): RadioCardOption[] {
  return options.map((option) => ({
    value: option.value,
    label: option.label,
  }))
}

export function mapChoiceSetOptionsToComboboxOptions(
  options: readonly ChoiceSetOption[],
): ComboboxFieldOption[] {
  return options.map((option) => ({
    value: option.id,
    label: option.label,
    description: option.description,
  }))
}

export function normalizeChoiceSetSelection(
  nextValue: string | string[] | undefined,
  max: number,
): string[] {
  const selections = Array.isArray(nextValue) ? nextValue : nextValue ? [nextValue] : []

  if (max === 1) {
    return selections.length > 0 ? [selections[selections.length - 1]!] : []
  }

  return selections.slice(0, max)
}
