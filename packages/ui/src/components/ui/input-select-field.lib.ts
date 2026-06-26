import { optionMatchesQuery } from './option-query.lib'

export interface InputSelectOption {
  label: string
  value: string
  description?: string
}

export function filterInputSelectOptions(
  options: InputSelectOption[],
  query: string,
): InputSelectOption[] {
  return options.filter((option) => optionMatchesQuery(option, query))
}

export function resolveInputSelectOption(
  value: string,
  options: InputSelectOption[],
): InputSelectOption {
  return options.find((option) => option.value === value) ?? { value, label: value }
}
