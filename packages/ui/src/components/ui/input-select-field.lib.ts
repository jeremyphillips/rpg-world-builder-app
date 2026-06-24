export interface InputSelectOption {
  label: string
  value: string
  description?: string
}

export function optionMatchesQuery(option: InputSelectOption, query: string): boolean {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return (
    option.label.toLowerCase().includes(normalized) ||
    option.value.toLowerCase().includes(normalized) ||
    (option.description?.toLowerCase().includes(normalized) ?? false)
  )
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
